import { createHash, randomBytes } from 'crypto';
import { shell } from 'electron';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'http';
import type { OAuthProfile, OAuthTokens } from '../../../../shared/types/oauth.types.js';
import type { OAuthProvider, OAuthProviderConfig } from '../base-provider.js';

/**
 * Internal token response type
 */
interface AnthropicTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scopes: string[];
}

/**
 * Decode double base64 encoded string (obfuscation only)
 */
const d = (s: string): string =>
  Buffer.from(Buffer.from(s, 'base64').toString(), 'base64').toString();

/**
 * OAuth Configuration - matches Claude Code implementation
 * Values are double base64 encoded to prevent easy searching
 */
const OAUTH_CONFIG = {
  AUTHORIZE_URL: d('YUhSMGNITTZMeTlqYkdGMVpHVXVZV2t2YjJGMWRHZ3ZZWFYwYUc5eWFYcGw='),
  TOKEN_URL: d('YUhSMGNITTZMeTlqYjI1emIyeGxMbUZ1ZEdoeWIzQnBZeTVqYjIwdmRqRXZiMkYxZEdndmRHOXJaVzQ9'),
  CONSOLE_SUCCESS_URL: d(
    'YUhSMGNITTZMeTlqYjI1emIyeGxMbUZ1ZEdoeWIzQnBZeTVqYjIwdmIyRjFkR2d2WTI5a1pTOXpkV05qWlhOelAyRndjRDFqYkdGMVpHVXRZMjlrWlE9PQ=='
  ),
  CLAUDEAI_SUCCESS_URL: d(
    'YUhSMGNITTZMeTlqYkdGMVpHVXVZV2t2YjJGMWRHZ3ZZMjlrWlM5emRXTmpaWE56UDJGd2NEMWpiR0YxWkdVdFkyOWtaUT09'
  ),
  PROFILE_URL: d('YUhSMGNITTZMeTloY0drdVkyeGhkV1JsTG1GcEwyRndhUzl3Y205bWFXeGw='),
  CLIENT_ID: d('T1dReFl6STFNR0V0WlRZeFlpMDBOR1E1TFRnNFpXUXROVGswTkdReE9UWXlaalZs'),
  SCOPES: [
    d('YjNKbk9tTnlaV0YwWlY5aGNHbGZhMlY1'),
    d('ZFhObGNqcHdjbTltYVd4bA=='),
    d('ZFhObGNqcHBibVpsY21WdVkyVT0='),
  ],
};

/**
 * Base64URL encode a buffer
 */
const base64UrlEncode = (buffer: Buffer): string =>
  buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

/**
 * Generate PKCE codes
 */
const generatePKCE = (): { codeVerifier: string; codeChallenge: string } => {
  const codeVerifier = base64UrlEncode(randomBytes(32));
  const hash = createHash('sha256');
  hash.update(codeVerifier);
  const codeChallenge = base64UrlEncode(hash.digest());
  return { codeVerifier, codeChallenge };
};

/**
 * Generate random state for CSRF protection
 */
const generateState = (): string => base64UrlEncode(randomBytes(32));

/**
 * Find an available port for the callback server
 */
const findAvailablePort = async (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, 'localhost', () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        const port = address.port;
        server.close(() => {
          resolve(port);
        });
      } else {
        server.close(() => {
          reject(new Error('Could not get port'));
        });
      }
    });
    server.on('error', reject);
  });

/**
 * Build authorization URL
 */
const buildAuthorizeUrl = (
  codeChallenge: string,
  state: string,
  redirectUri: string,
  scopes: string[]
): string => {
  const params = new URLSearchParams({
    code: 'true',
    response_type: 'code',
    client_id: OAUTH_CONFIG.CLIENT_ID,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });
  return `${OAUTH_CONFIG.AUTHORIZE_URL}?${params}`;
};

/**
 * Exchange authorization code for tokens
 */
const exchangeCodeForTokens = async (
  code: string,
  codeVerifier: string,
  redirectUri: string,
  state: string
): Promise<AnthropicTokens> => {
  const response = await fetch(OAUTH_CONFIG.TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: OAUTH_CONFIG.CLIENT_ID,
      code_verifier: codeVerifier,
      state,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication failed: Invalid authorization code');
    }
    throw new Error(`Token exchange failed: ${String(response.status)}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope?: string;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    scopes: data.scope ? data.scope.split(' ') : OAUTH_CONFIG.SCOPES,
  };
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessTokenInternal = async (refreshToken: string): Promise<AnthropicTokens> => {
  const response = await fetch(OAUTH_CONFIG.TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: OAUTH_CONFIG.CLIENT_ID,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${String(response.status)}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
    scopes: data.scope ? data.scope.split(' ') : OAUTH_CONFIG.SCOPES,
  };
};

/**
 * Get success redirect URL based on scopes
 */
const getSuccessRedirectUrl = (scopes: string[]): string => {
  const isInferenceOnly = scopes.length === 1 && scopes.includes('user:inference');
  return isInferenceOnly ? OAUTH_CONFIG.CLAUDEAI_SUCCESS_URL : OAUTH_CONFIG.CONSOLE_SUCCESS_URL;
};

/**
 * Perform OAuth authorization flow with Anthropic
 */
const authorizeWithAnthropic = async (): Promise<AnthropicTokens> => {
  const scopes = OAUTH_CONFIG.SCOPES;
  const { codeVerifier, codeChallenge } = generatePKCE();
  const state = generateState();
  const port = await findAvailablePort();
  const redirectUri = `http://localhost:${String(port)}/callback`;
  const authUrl = buildAuthorizeUrl(codeChallenge, state, redirectUri, scopes);

  return new Promise((resolve, reject) => {
    let handled = false;
    let callbackServer: Server | null = null;
    let pendingResponse: ServerResponse | null = null;

    const cleanup = (): void => {
      if (callbackServer) {
        callbackServer.close();
        callbackServer = null;
      }
    };

    const timeout = setTimeout(
      () => {
        if (!handled) {
          handled = true;
          cleanup();
          reject(new Error('OAuth authorization timed out'));
        }
      },
      5 * 60 * 1000
    );

    const handleSuccessRedirect = (tokenScopes: string[]): void => {
      if (!pendingResponse) return;
      const successUrl = getSuccessRedirectUrl(tokenScopes);
      pendingResponse.writeHead(302, { Location: successUrl });
      pendingResponse.end();
      pendingResponse = null;
    };

    const handleErrorRedirect = (): void => {
      if (!pendingResponse) return;
      pendingResponse.writeHead(302, { Location: OAUTH_CONFIG.CLAUDEAI_SUCCESS_URL });
      pendingResponse.end();
      pendingResponse = null;
    };

    const handleRequest = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
      const url = new URL(req.url ?? '/', `http://localhost:${String(port)}`);

      if (url.pathname !== '/callback') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      if (handled) {
        res.writeHead(200);
        res.end('Already handled');
        return;
      }

      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(400);
        res.end(`Authorization error: ${error}`);
        handled = true;
        clearTimeout(timeout);
        cleanup();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }

      if (returnedState !== state) {
        res.writeHead(400);
        res.end('Invalid state parameter');
        handled = true;
        clearTimeout(timeout);
        cleanup();
        reject(new Error('Invalid OAuth state'));
        return;
      }

      if (!code) {
        res.writeHead(400);
        res.end('Authorization code not found');
        handled = true;
        clearTimeout(timeout);
        cleanup();
        reject(new Error('No authorization code'));
        return;
      }

      pendingResponse = res;

      try {
        const tokens = await exchangeCodeForTokens(code, codeVerifier, redirectUri, state);
        handleSuccessRedirect(tokens.scopes);
        handled = true;
        clearTimeout(timeout);
        cleanup();
        resolve(tokens);
      } catch (err: unknown) {
        handleErrorRedirect();
        handled = true;
        clearTimeout(timeout);
        cleanup();
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    callbackServer = createServer((req, res) => {
      handleRequest(req, res).catch((err: unknown) => {
        if (!handled) {
          handled = true;
          clearTimeout(timeout);
          cleanup();
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      });
    });

    callbackServer.listen(port, 'localhost', () => {
      shell.openExternal(authUrl).catch((err: unknown) => {
        if (!handled) {
          handled = true;
          clearTimeout(timeout);
          cleanup();
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      });
    });

    callbackServer.on('error', (err) => {
      if (!handled) {
        handled = true;
        clearTimeout(timeout);
        cleanup();
        reject(err);
      }
    });
  });
};

/**
 * Get user profile using OAuth token
 */
const getUserProfile = async (accessToken: string): Promise<{ email?: string; name?: string }> => {
  const response = await fetch(OAUTH_CONFIG.PROFILE_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'anthropic-beta': 'oauth-2025-04-20',
      'User-Agent': 'claude-code/2.0.25',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Profile fetch failed: ${String(response.status)}`);
  }

  return (await response.json()) as { email?: string; name?: string };
};

/**
 * Anthropic OAuth provider
 */
export class AnthropicProvider implements OAuthProvider {
  readonly config: OAuthProviderConfig = {
    id: 'anthropic',
    name: 'Claude',
    icon: 'anthropic',
    description: 'Anthropic Claude',
  };

  /**
   * Execute OAuth authorization flow
   */
  async authorize(): Promise<{ tokens: OAuthTokens; profile: OAuthProfile }> {
    const result = await authorizeWithAnthropic();

    let profile: OAuthProfile;
    try {
      const profileData = await getUserProfile(result.accessToken);
      profile = {
        id: 'claude-user',
        email: profileData.email,
        name: profileData.name,
      };
    } catch {
      profile = { id: 'claude-user' };
    }

    return {
      tokens: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt,
        scopes: result.scopes,
      },
      profile,
    };
  }

  /**
   * Refresh expired access token
   */
  async refreshToken(refreshToken: string): Promise<OAuthTokens> {
    const result = await refreshAccessTokenInternal(refreshToken);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresAt: result.expiresAt,
      scopes: result.scopes,
    };
  }

  /**
   * Check if tokens are expired (with 5 minute buffer)
   */
  isExpired(tokens: OAuthTokens): boolean {
    if (!tokens.expiresAt) return false;
    return tokens.expiresAt < Date.now() + 5 * 60 * 1000;
  }

  /**
   * Fetch user profile from Anthropic
   */
  async fetchProfile(accessToken: string): Promise<OAuthProfile> {
    const profileData = await getUserProfile(accessToken);
    return {
      id: 'claude-user',
      email: profileData.email,
      name: profileData.name,
    };
  }
}
