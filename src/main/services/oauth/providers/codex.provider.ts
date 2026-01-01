import type { OAuthProfile, OAuthTokens } from '../../../../shared/types/oauth.types.js';
import { authorizeWithOpenAI } from '../../openai.oauth.service.js';
import type { OAuthProvider, OAuthProviderConfig } from '../base-provider.js';

/**
 * OpenAI OAuth configuration
 */
const OPENAI_OAUTH_CONFIG = {
  TOKEN_URL: 'https://auth.openai.com/oauth/token',
  CLIENT_ID: 'app_EMoamEEZ73f0CkXaXp7hrann',
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
        expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour default
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
    // OpenAI profile comes from id_token, not a separate endpoint
    return Promise.resolve({ id: 'unknown' });
  }

  /**
   * Extract profile from JWT id_token
   */
  private extractProfileFromIdToken(idToken: string): OAuthProfile {
    try {
      const parts = idToken.split('.');
      if (parts.length !== 3) return { id: 'unknown' };

      // Handle URL-safe base64
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
