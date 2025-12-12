import { shell } from 'electron';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { URL } from 'url';
import type {
  AuthState,
  LinkedProvider,
  LinkProviderResult,
  OAuthProvider,
  UnlinkProviderResult,
  User,
} from '../../shared/types/auth.types.js';
import { getRegistryUrl, isTokenExpired, loadConfig, saveConfig } from './config.service.js';

const OAUTH_PORT = 3739;
const OAUTH_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

let callbackServer: Server | null = null;

export const getBackendUrl = async (): Promise<string> => getRegistryUrl();

const shutdownServer = (): void => {
  if (callbackServer) {
    callbackServer.close();
    callbackServer = null;
  }
};

const decodeJwt = (token: string): { exp?: number } => {
  try {
    const [, payload] = token.split('.');
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded) as { exp?: number };
  } catch {
    return {};
  }
};

const fetchUserInfo = async (backendUrl: string, token: string): Promise<User> => {
  const response = await fetch(`${backendUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  return (await response.json()) as User;
};

const handleToken = async (token: string, githubToken?: string): Promise<AuthState> => {
  const backendUrl = await getBackendUrl();
  const user = await fetchUserInfo(backendUrl, token);
  const decoded = decodeJwt(token);
  // Convert exp (seconds) to ISO string
  const expiresAt = decoded.exp ? new Date(decoded.exp * 1000).toISOString() : undefined;

  const authState: AuthState = { token, expiresAt, user, githubToken };

  // Save to config (CLI compatible format)
  const config = await loadConfig();
  await saveConfig({ ...config, auth: authState });

  return authState;
};

const tryStartServer = (port: number): Promise<Server> =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(port, () => {
      server.removeListener('error', reject);
      resolve(server);
    });
  });

const startServerWithRetry = async (
  basePort: number,
  maxAttempts = 3
): Promise<{ server: Server; port: number }> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const port = basePort + attempt;
    try {
      const server = await tryStartServer(port);
      return { server, port };
    } catch {
      if (attempt === maxAttempts - 1) {
        throw new Error(`Failed to start OAuth server after ${String(maxAttempts)} attempts`);
      }
    }
  }
  throw new Error('Failed to start OAuth server');
};

export const startOAuthFlow = async (): Promise<AuthState> => {
  const backendUrl = await getBackendUrl();

  const { server, port } = await startServerWithRetry(OAUTH_PORT);
  callbackServer = server;

  const callbackUrl = `http://localhost:${String(port)}/callback`;
  // NEW: Open browser to /desktop-login page instead of direct OAuth URL
  const loginPageUrl = `${backendUrl}/desktop-login?callback=${encodeURIComponent(callbackUrl)}`;

  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | null = null;

    const cleanup = (): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      shutdownServer();
    };

    const handleRequest = (req: IncomingMessage, res: ServerResponse): void => {
      const url = new URL(req.url ?? '/', `http://localhost:${String(port)}`);

      if (url.pathname === '/callback') {
        const token = url.searchParams.get('token');
        const githubToken = url.searchParams.get('github_token');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(
            '<html><body><h1>Login Failed</h1><p>You can close this window.</p></body></html>'
          );
          cleanup();
          reject(new Error(error));
          return;
        }

        if (token) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(
            '<html><body><h1>✓ Login Successful!</h1><p>You can close this window and return to the desktop app.</p></body></html>'
          );
          cleanup();

          handleToken(token, githubToken ?? undefined)
            .then(resolve)
            .catch(reject);
          return;
        }

        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<html><body><h1>Invalid Response</h1></body></html>');
        cleanup();
        reject(new Error('No token received'));
      }
    };

    server.on('request', handleRequest);

    // Open browser to desktop login page (not direct OAuth URL)
    void shell.openExternal(loginPageUrl);

    // Timeout after 5 minutes
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('OAuth flow timed out'));
    }, OAUTH_TIMEOUT);
  });
};

export const logout = async (): Promise<void> => {
  const config = await loadConfig();
  // Remove auth from config by destructuring it out
  const configWithoutAuth = { ...config };
  delete configWithoutAuth.auth;
  await saveConfig(configWithoutAuth);
};

export const getUser = async (): Promise<User | null> => {
  const config = await loadConfig();
  if (!config.auth?.user) return null;

  // Check if token is expired (using ISO string)
  if (isTokenExpired(config.auth.expiresAt)) {
    await logout();
    return null;
  }

  return config.auth.user;
};

export const getAuthToken = async (): Promise<string | null> => {
  const config = await loadConfig();
  return config.auth?.token ?? null;
};

export const refreshTokenIfNeeded = async (): Promise<boolean> => {
  const config = await loadConfig();
  if (!config.auth) return false;

  // Check if within refresh threshold
  if (config.auth.expiresAt) {
    const expiresAtMs = new Date(config.auth.expiresAt).getTime();
    const timeUntilExpiry = expiresAtMs - Date.now();
    if (timeUntilExpiry > TOKEN_REFRESH_THRESHOLD) return true;
  }

  try {
    const backendUrl = await getBackendUrl();
    const response = await fetch(`${backendUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.auth.token}` },
    });

    if (!response.ok) {
      await logout();
      return false;
    }

    const { token } = (await response.json()) as { token: string };
    await handleToken(token);
    return true;
  } catch {
    await logout();
    return false;
  }
};

/**
 * Link a new OAuth provider to existing authenticated user
 * Opens browser to /desktop-login page with link action
 */
export const linkProvider = async (provider: OAuthProvider): Promise<LinkProviderResult> => {
  const config = await loadConfig();
  if (!config.auth?.token) {
    return { success: false, error: 'Not authenticated' };
  }

  const backendUrl = await getBackendUrl();
  const { server, port } = await startServerWithRetry(OAUTH_PORT);
  callbackServer = server;

  const callbackUrl = `http://localhost:${String(port)}/callback`;

  // Encode current token for backend verification
  const state = Buffer.from(config.auth.token).toString('base64');

  // Open /desktop-login page with link action
  const linkUrl = `${backendUrl}/desktop-login?callback=${encodeURIComponent(callbackUrl)}&action=link&provider=${provider}&token=${state}`;

  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | null = null;

    const cleanup = (): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      shutdownServer();
    };

    const handleRequest = (req: IncomingMessage, res: ServerResponse): void => {
      const url = new URL(req.url ?? '/', `http://localhost:${String(port)}`);

      if (url.pathname === '/callback') {
        const success = url.searchParams.get('success');
        const githubToken = url.searchParams.get('github_token');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(
            '<html><body><h1>Connection Failed</h1><p>You can close this window.</p></body></html>'
          );
          cleanup();
          reject(new Error(error));
          return;
        }

        if (success === 'true') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(
            '<html><body><h1>\u2713 Provider Connected!</h1><p>You can close this window and return to the desktop app.</p></body></html>'
          );
          cleanup();

          // Refresh user info and save GitHub token if present
          const refreshUser = async (): Promise<void> => {
            try {
              if (!config.auth) {
                reject(new Error('No authentication config'));
                return;
              }
              const user = await fetchUserInfo(backendUrl, config.auth.token);
              const updatedAuth: AuthState = {
                token: config.auth.token,
                expiresAt: config.auth.expiresAt,
                user,
                githubToken: githubToken && provider === 'github' ? githubToken : undefined,
              };

              await saveConfig({ ...config, auth: updatedAuth });

              resolve({
                success: true,
                provider: {
                  name: provider,
                  email: user.email,
                  connectedAt: new Date().toISOString(),
                },
                providerToken: githubToken ?? undefined,
              });
            } catch (err) {
              reject(err instanceof Error ? err : new Error(String(err)));
            }
          };

          void refreshUser();
          return;
        }

        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<html><body><h1>Invalid Response</h1></body></html>');
        cleanup();
        reject(new Error('Invalid callback response'));
      }
    };

    server.on('request', handleRequest);

    // Open browser to link URL
    void shell.openExternal(linkUrl);

    // Timeout after 5 minutes
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('Provider linking timed out'));
    }, OAUTH_TIMEOUT);
  });
};

/**
 * Get all linked OAuth providers for current user
 */
export const getLinkedProviders = async (): Promise<LinkedProvider[]> => {
  const config = await loadConfig();
  if (!config.auth?.token) return [];

  const backendUrl = await getBackendUrl();
  try {
    const response = await fetch(`${backendUrl}/api/auth/providers`, {
      headers: { Authorization: `Bearer ${config.auth.token}` },
    });

    if (!response.ok) return [];
    const data = (await response.json()) as { providers: LinkedProvider[] };
    return data.providers;
  } catch {
    return [];
  }
};

/**
 * Unlink an OAuth provider from current user
 */
export const unlinkProvider = async (provider: OAuthProvider): Promise<UnlinkProviderResult> => {
  const config = await loadConfig();
  if (!config.auth?.token) {
    return { success: false, error: 'Not authenticated' };
  }

  const backendUrl = await getBackendUrl();
  try {
    const response = await fetch(`${backendUrl}/api/auth/unlink/${provider}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.auth.token}` },
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      return { success: false, error: error.message ?? 'Failed to unlink provider' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};
