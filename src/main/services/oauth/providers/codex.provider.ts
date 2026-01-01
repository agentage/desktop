import { createHash, randomBytes } from 'crypto';
import { shell } from 'electron';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'http';
import type { OAuthProfile, OAuthTokens } from '../../../../shared/types/oauth.types.js';
import type { OAuthProvider, OAuthProviderConfig } from '../base-provider.js';

/**
 * Internal OpenAI OAuth tokens
 */
interface OpenAIOAuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  accountId?: string;
}

/**
 * OpenAI OAuth Configuration - matches Codex CLI implementation
 */
const OPENAI_OAUTH_CONFIG = {
  CLIENT_ID: 'app_EMoamEEZ73f0CkXaXp7hrann',
  ISSUER: 'https://auth.openai.com',
  SCOPES: 'openid profile email offline_access',
  get TOKEN_URL(): string {
    return `${this.ISSUER}/oauth/token`;
  },
  get AUTHORIZE_URL(): string {
    return `${this.ISSUER}/oauth/authorize`;
  },
};

/**
 * Default port for OpenAI OAuth callback (same as Codex CLI)
 */
const DEFAULT_OAUTH_PORT = 1455;

/**
 * Base64URL encode a buffer
 */
const base64UrlEncode = (buffer: Buffer): string =>
  buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

/**
 * Generate PKCE codes - matches Codex CLI implementation
 */
const generatePKCE = (): { codeVerifier: string; codeChallenge: string } => {
  const codeVerifier = base64UrlEncode(randomBytes(64));
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
    server.listen(DEFAULT_OAUTH_PORT, 'localhost', () => {
      server.close(() => {
        resolve(DEFAULT_OAUTH_PORT);
      });
    });
    server.on('error', () => {
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
 * Build OpenAI authorization URL - matches Codex CLI implementation
 */
const buildAuthorizeUrl = (codeChallenge: string, state: string, redirectUri: string): string => {
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
  return `${OPENAI_OAUTH_CONFIG.AUTHORIZE_URL}?${queryString}`;
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
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
 * Perform OAuth authorization flow with OpenAI
 */
const authorizeWithOpenAI = async (): Promise<OpenAIOAuthTokens> => {
  const { codeVerifier, codeChallenge } = generatePKCE();
  const state = generateState();
  const port = await findAvailablePort();
  const redirectUri = `http://localhost:${String(port)}/auth/callback`;
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

    const handleRequest = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
      const url = new URL(req.url ?? '/', `http://127.0.0.1:${String(port)}`);

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

      try {
        const tokens = await exchangeCodeForTokens(code, codeVerifier, redirectUri);

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
 * OpenAI OAuth provider
 */
export class OpenAIProvider implements OAuthProvider {
  readonly config: OAuthProviderConfig = {
    id: 'openai',
    name: 'OpenAI',
    icon: 'openai',
    description: 'OpenAI ChatGPT',
  };

  /**
   * Execute OAuth authorization flow
   */
  async authorize(): Promise<{ tokens: OAuthTokens; profile: OAuthProfile }> {
    const result = await authorizeWithOpenAI();
    const profile = this.extractProfileFromIdToken(result.idToken);

    return {
      tokens: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        idToken: result.idToken,
        expiresAt: Date.now() + 60 * 60 * 1000,
      },
      profile,
    };
  }

  /**
   * Refresh expired access token
   */
  async refreshToken(refreshToken: string): Promise<OAuthTokens> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: OPENAI_OAUTH_CONFIG.CLIENT_ID,
    });

    const response = await fetch(OPENAI_OAUTH_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${String(response.status)} ${errorText}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      id_token?: string;
      expires_in?: number;
    };

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? refreshToken,
      idToken: data.id_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
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
   * Fetch user profile - for OpenAI, profile is in id_token
   */
  fetchProfile(_accessToken: string): Promise<OAuthProfile> {
    return Promise.resolve({ id: 'unknown' });
  }

  /**
   * Extract profile from JWT id_token
   */
  private extractProfileFromIdToken(idToken: string): OAuthProfile {
    try {
      const parts = idToken.split('.');
      if (parts.length !== 3) return { id: 'unknown' };

      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString()) as {
        sub?: string;
        email?: string;
        name?: string;
        'https://api.openai.com/auth'?: {
          chatgpt_account_id?: string;
        };
      };

      return {
        id: payload.sub ?? payload['https://api.openai.com/auth']?.chatgpt_account_id ?? 'unknown',
        email: payload.email,
        name: payload.name,
      };
    } catch {
      return { id: 'unknown' };
    }
  }
}
