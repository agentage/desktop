import { createHash, randomBytes } from 'crypto';
import { shell } from 'electron';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'http';

/**
 * OpenAI OAuth tokens response
 */
export interface OpenAIOAuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  accountId?: string;
}

/**
 * OpenAI OAuth Configuration - matches Codex CLI implementation
 */
const OPENAI_OAUTH_CONFIG = {
  // Client ID from Codex CLI
  CLIENT_ID: 'app_EMoamEEZ73f0CkXaXp7hrann',

  // OAuth issuer base URL
  ISSUER: 'https://auth.openai.com',

  // Scopes for OAuth
  SCOPES: 'openid profile email offline_access',

  // Token exchange endpoint
  get TOKEN_URL(): string {
    return `${this.ISSUER}/oauth/token`;
  },

  // Authorization endpoint
  get AUTHORIZE_URL(): string {
    return `${this.ISSUER}/oauth/authorize`;
  },
};

/**
 * PKCE code pair for OAuth flow
 */
interface PKCECodes {
  codeVerifier: string;
  codeChallenge: string;
}

/**
 * Base64URL encode a buffer
 */
const base64UrlEncode = (buffer: Buffer): string =>
  buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

/**
 * Generate PKCE code verifier and challenge
 * Matches Codex CLI's implementation
 */
const generatePKCE = (): PKCECodes => {
  // Generate 64 random bytes and base64url encode (matches Codex CLI)
  const codeVerifier = base64UrlEncode(randomBytes(64));

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
 * Default port for OpenAI OAuth callback (same as Codex CLI)
 */
const DEFAULT_OAUTH_PORT = 1455;

/**
 * Find an available port for the callback server
 * Tries default port 1455 first (like Codex CLI), falls back to random port
 */
const findAvailablePort = async (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = createServer();
    // Try default port first
    server.listen(DEFAULT_OAUTH_PORT, 'localhost', () => {
      server.close(() => {
        resolve(DEFAULT_OAUTH_PORT);
      });
    });
    server.on('error', () => {
      // Default port in use, try random port
      const fallbackServer = createServer();
      fallbackServer.listen(0, 'localhost', () => {
        const address = fallbackServer.address();
        if (address && typeof address === 'object') {
          const port = address.port;
          fallbackServer.close(() => {
            resolve(port);
          });
        } else {
          fallbackServer.close(() => {
            reject(new Error('Could not get port'));
          });
        }
      });
      fallbackServer.on('error', reject);
    });
  });

/**
 * Build OpenAI authorization URL
 * Matches Codex CLI's build_authorize_url implementation
 */
const buildAuthorizeUrl = (codeChallenge: string, state: string, redirectUri: string): string => {
  // Build query string manually like Codex CLI does (using urlencoding::encode)
  const params: [string, string][] = [
    ['response_type', 'code'],
    ['client_id', OPENAI_OAUTH_CONFIG.CLIENT_ID],
    ['redirect_uri', redirectUri],
    ['scope', OPENAI_OAUTH_CONFIG.SCOPES],
    ['code_challenge', codeChallenge],
    ['code_challenge_method', 'S256'],
    ['id_token_add_organizations', 'true'],
    ['codex_cli_simplified_flow', 'true'],
    ['state', state],
    ['originator', 'codex_cli_rs'],
  ];

  const queryString = params.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  const url = `${OPENAI_OAUTH_CONFIG.AUTHORIZE_URL}?${queryString}`;

  return url;
};

/**
 * Exchange authorization code for tokens
 */
const exchangeCodeForTokens = async (
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<OpenAIOAuthTokens> => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: OPENAI_OAUTH_CONFIG.CLIENT_ID,
    code_verifier: codeVerifier,
  });

  const response = await fetch(OPENAI_OAUTH_CONFIG.TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${String(response.status)} ${errorText}`);
  }

  const data = (await response.json()) as {
    id_token: string;
    access_token: string;
    refresh_token: string;
  };

  // Extract account_id from id_token claims
  const accountId = extractAccountIdFromIdToken(data.id_token);

  return {
    idToken: data.id_token,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    accountId,
  };
};

/**
 * JWT claims structure from OpenAI id_token
 */
interface OpenAIJWTAuthClaims {
  chatgpt_account_id?: string;
  organization_id?: string;
  organizations?: { id: string; is_default?: boolean }[];
  project_id?: string;
}

/**
 * Extract auth claims from JWT id_token
 */
const extractAuthClaimsFromIdToken = (idToken: string): OpenAIJWTAuthClaims | undefined => {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return undefined;

    // Handle URL-safe base64
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString()) as {
      'https://api.openai.com/auth'?: OpenAIJWTAuthClaims;
    };

    return payload['https://api.openai.com/auth'];
  } catch {
    return undefined;
  }
};

/**
 * Extract chatgpt_account_id from JWT id_token
 */
const extractAccountIdFromIdToken = (idToken: string): string | undefined =>
  extractAuthClaimsFromIdToken(idToken)?.chatgpt_account_id;

/**
 * Exchange id_token for an OpenAI API key using token-exchange grant
 * This is the preferred way to get a long-lived API key
 * NOTE: Requires the id_token to have organization_id claim embedded
 */
export const exchangeIdTokenForApiKey = async (idToken: string): Promise<string> => {
  // Standard token exchange - no organization_id parameter (it must be in the id_token)
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
    client_id: OPENAI_OAUTH_CONFIG.CLIENT_ID,
    requested_token: 'openai-api-key',
    subject_token: idToken,
    subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
  });

  const response = await fetch(OPENAI_OAUTH_CONFIG.TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API key exchange failed: ${String(response.status)} ${errorText}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
};

/**
 * Perform OAuth authorization flow with OpenAI
 * Opens system browser for authentication, then catches callback on localhost
 */
export const authorizeWithOpenAI = async (): Promise<OpenAIOAuthTokens> => {
  // Generate PKCE codes
  const { codeVerifier, codeChallenge } = generatePKCE();
  const state = generateState();

  // Find available port for callback
  const port = await findAvailablePort();
  // Use localhost to match Codex CLI exactly (server.rs line 116)
  const redirectUri = `http://localhost:${String(port)}/auth/callback`;

  // Build authorization URL
  const authUrl = buildAuthorizeUrl(codeChallenge, state, redirectUri);

  return new Promise((resolve, reject) => {
    let handled = false;
    let callbackServer: Server | null = null;

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
          reject(new Error('OpenAI OAuth authorization timed out'));
        }
      },
      5 * 60 * 1000
    );

    /**
     * Handle incoming HTTP request
     */
    const handleRequest = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
      const url = new URL(req.url ?? '/', `http://127.0.0.1:${String(port)}`);

      // Only accept /auth/callback path (matches Codex CLI)
      if (url.pathname !== '/auth/callback') {
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
        const errorDescription = url.searchParams.get('error_description') ?? error;
        res.writeHead(400);
        res.end(`Authorization error: ${errorDescription}`);
        handled = true;
        clearTimeout(timeout);
        cleanup();
        reject(new Error(`OpenAI OAuth error: ${errorDescription}`));
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

      // Exchange code for tokens
      try {
        const tokens = await exchangeCodeForTokens(code, codeVerifier, redirectUri);

        // Send success response to browser
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head><title>Success</title></head>
          <body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
            <div style="text-align: center;">
              <h2 style="color: #10a37f;">✓ Authentication successful</h2>
              <p>You can close this window and return to Agentage.</p>
            </div>
          </body>
          </html>
        `);

        handled = true;
        clearTimeout(timeout);
        cleanup();
        resolve(tokens);
      } catch (err: unknown) {
        res.writeHead(500);
        res.end(`Token exchange failed: ${err instanceof Error ? err.message : String(err)}`);

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
