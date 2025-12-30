import { createHash, randomBytes } from 'crypto';
import { shell } from 'electron';
import { readFile } from 'fs/promises';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'http';
import { homedir } from 'os';
import { join } from 'path';

/**
 * OAuth tokens response from Anthropic
 */
export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scopes: string[];
}

/**
 * Decode double base64 encoded string (obfuscation only)
 */
const d = (s: string): string => Buffer.from(Buffer.from(s, 'base64').toString(), 'base64').toString();

/**
 * OAuth Configuration - matches Claude Code implementation
 * Values are double base64 encoded to prevent easy searching
 */
const OAUTH_CONFIG = {
  // Authorization endpoints
  AUTHORIZE_URL: d('YUhSMGNITTZMeTlqYkdGMVpHVXVZV2t2YjJGMWRHZ3ZZWFYwYUc5eWFYcGw='),

  // Token exchange
  TOKEN_URL: d('YUhSMGNITTZMeTlqYjI1emIyeGxMbUZ1ZEdoeWIzQnBZeTVqYjIwdmRqRXZiMkYxZEdndmRHOXJaVzQ9'),

  // Success redirects
  CONSOLE_SUCCESS_URL: d(
    'YUhSMGNITTZMeTlqYjI1emIyeGxMbUZ1ZEdoeWIzQnBZeTVqYjIwdmIyRjFkR2d2WTI5a1pTOXpkV05qWlhOelAyRndjRDFqYkdGMVpHVXRZMjlrWlE9PQ=='
  ),
  CLAUDEAI_SUCCESS_URL: d(
    'YUhSMGNITTZMeTlqYkdGMVpHVXVZV2t2YjJGMWRHZ3ZZMjlrWlM5emRXTmpaWE56UDJGd2NEMWpiR0YxWkdVdFkyOWtaUT09'
  ),

  // API endpoints
  CREATE_API_KEY_URL: d(
    'YUhSMGNITTZMeTloY0drdVlXNTBhSEp2Y0dsakxtTnZiUzloY0drdmIyRjFkR2d2WTJ4aGRXUmxYMk5zYVM5amNtVmhkR1ZmWVhCcFgydGxlUT09'
  ),
  PROFILE_URL: d('YUhSMGNITTZMeTloY0drdVkyeGhkV1JsTG1GcEwyRndhUzl3Y205bWFXeGw='),

  // Client credentials
  CLIENT_ID: d('T1dReFl6STFNR0V0WlRZeFlpMDBOR1E1TFRnNFpXUXROVGswTkdReE9UWXlaalZs'),

  // Default scopes
  SCOPES: [
    d('YjNKbk9tTnlaV0YwWlY5aGNHbGZhMlY1'),
    d('ZFhObGNqcHdjbTltYVd4bA=='),
    d('ZFhObGNqcHBibVpsY21WdVkyVT0='),
  ],
};

/**
 * Claude CLI credentials file structure
 */
interface ClaudeCliCredentials {
  claudeAiOauth?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    scopes: string[];
  };
}

/**
 * Get the path to Claude CLI credentials file
 */
const getClaudeCredentialsPath = (): string => join(homedir(), '.claude', '.credentials.json');

/**
 * Read existing OAuth tokens from Claude CLI credentials
 * Returns tokens if valid and not expired
 */
export const getExistingClaudeTokens = async (): Promise<OAuthTokens | null> => {
  try {
    const credentialsPath = getClaudeCredentialsPath();
    const content = await readFile(credentialsPath, 'utf-8');
    const credentials = JSON.parse(content) as ClaudeCliCredentials;

    if (!credentials.claudeAiOauth) {
      return null;
    }

    const { accessToken, refreshToken, expiresAt, scopes } = credentials.claudeAiOauth;

    // Check if token is expired (with 10 minute buffer)
    if (expiresAt < Date.now() + 10 * 60 * 1000) {
      return null;
    }

    return { accessToken, refreshToken, expiresAt, scopes };
  } catch {
    return null;
  }
};

/**
 * PKCE code pair for OAuth flow
 */
interface PKCECodes {
  codeVerifier: string;
  codeChallenge: string;
}

/**
 * Base64URL encode a buffer (matches Claude Code implementation)
 */
const base64UrlEncode = (buffer: Buffer): string =>
  buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

/**
 * Generate PKCE code verifier and challenge
 * Matches Claude Code's implementation exactly
 */
const generatePKCE = (): PKCECodes => {
  // Generate 32 random bytes and base64url encode
  const codeVerifier = base64UrlEncode(randomBytes(32));

  // Generate SHA256 hash of verifier, base64url encoded
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
    // Port 0 = OS assigns random port (matches Claude Code behavior)
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
 * Exchange authorization code for tokens
 * Matches Claude Code's token exchange implementation
 */
const exchangeCodeForTokens = async (
  code: string,
  codeVerifier: string,
  redirectUri: string,
  state: string
): Promise<OAuthTokens> => {
  const response = await fetch(OAUTH_CONFIG.TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
export const refreshAccessToken = async (refreshToken: string): Promise<OAuthTokens> => {
  const response = await fetch(OAUTH_CONFIG.TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  // Inference-only goes to claude.ai, full OAuth goes to console
  const isInferenceOnly = scopes.length === 1 && scopes.includes('user:inference');
  return isInferenceOnly ? OAUTH_CONFIG.CLAUDEAI_SUCCESS_URL : OAUTH_CONFIG.CONSOLE_SUCCESS_URL;
};

/**
 * Build authorization URL (matches Claude Code implementation)
 */
const buildAuthorizeUrl = (
  codeChallenge: string,
  state: string,
  redirectUri: string,
  scopes: string[]
): string => {
  const params = new URLSearchParams({
    code: 'true', // Critical: must include code=true
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
 * OAuth configuration options
 */
interface OAuthOptions {
  scopes?: string[];
}

/**
 * Perform OAuth authorization flow with Anthropic
 * Opens system browser for authentication, then catches callback on localhost
 */
export const authorizeWithAnthropic = async (options: OAuthOptions = {}): Promise<OAuthTokens> => {
  const scopes = options.scopes ?? OAUTH_CONFIG.SCOPES;

  // Generate PKCE codes
  const { codeVerifier, codeChallenge } = generatePKCE();
  const state = generateState();

  // Find available port for callback
  const port = await findAvailablePort();
  const redirectUri = `http://localhost:${String(port)}/callback`;

  // Build authorization URL
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

    // Timeout after 5 minutes
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

    /**
     * Handle redirect to success/error page
     */
    const handleSuccessRedirect = (tokenScopes: string[]): void => {
      if (!pendingResponse) return;
      const successUrl = getSuccessRedirectUrl(tokenScopes);
      pendingResponse.writeHead(302, { Location: successUrl });
      pendingResponse.end();
      pendingResponse = null;
    };

    const handleErrorRedirect = (): void => {
      if (!pendingResponse) return;
      const errorUrl = OAUTH_CONFIG.CLAUDEAI_SUCCESS_URL;
      pendingResponse.writeHead(302, { Location: errorUrl });
      pendingResponse.end();
      pendingResponse = null;
    };

    /**
     * Handle incoming HTTP request
     */
    const handleRequest = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
      const url = new URL(req.url ?? '/', `http://localhost:${String(port)}`);

      // Only accept /callback path
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

      // Handle error from OAuth server
      if (error) {
        res.writeHead(400);
        res.end(`Authorization error: ${error}`);
        handled = true;
        clearTimeout(timeout);
        cleanup();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }

      // Validate state parameter (CSRF protection)
      if (returnedState !== state) {
        res.writeHead(400);
        res.end('Invalid state parameter');
        handled = true;
        clearTimeout(timeout);
        cleanup();
        reject(new Error('Invalid OAuth state'));
        return;
      }

      // Validate authorization code
      if (!code) {
        res.writeHead(400);
        res.end('Authorization code not found');
        handled = true;
        clearTimeout(timeout);
        cleanup();
        reject(new Error('No authorization code'));
        return;
      }

      // Store response to redirect later
      pendingResponse = res;

      // Exchange code for tokens
      try {
        const tokens = await exchangeCodeForTokens(code, codeVerifier, redirectUri, state);

        // Redirect browser to success page
        handleSuccessRedirect(tokens.scopes);

        handled = true;
        clearTimeout(timeout);
        cleanup();
        resolve(tokens);
      } catch (err: unknown) {
        // Redirect browser to error page
        handleErrorRedirect();

        handled = true;
        clearTimeout(timeout);
        cleanup();
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    // Start callback server
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
      // Open system browser for authentication
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
 * Create an API key using OAuth token
 * Requires 'org:create_api_key' scope
 */
export const createApiKeyWithOAuth = async (
  accessToken: string,
  name = 'Agentage Desktop'
): Promise<string> => {
  const response = await fetch(OAUTH_CONFIG.CREATE_API_KEY_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'anthropic-beta': 'oauth-2025-04-20',
      'User-Agent': 'claude-code/2.0.25',
    },
    body: JSON.stringify({ name }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API key creation failed: ${String(response.status)} ${errorText}`);
  }

  const data = (await response.json()) as { api_key: string };
  return data.api_key;
};

/**
 * Get user profile using OAuth token
 */
export const getUserProfile = async (
  accessToken: string
): Promise<{ email?: string; name?: string }> => {
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
