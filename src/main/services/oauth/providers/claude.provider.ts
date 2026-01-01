import type { OAuthProfile, OAuthTokens } from '../../../../shared/types/oauth.types.js';
import {
  authorizeWithAnthropic,
  getUserProfile,
  refreshAccessToken,
} from '../../anthropic.oauth.service.js';
import type { OAuthProvider, OAuthProviderConfig } from '../base-provider.js';

/**
 * Claude (Anthropic) OAuth provider
 */
export class ClaudeProvider implements OAuthProvider {
  readonly config: OAuthProviderConfig = {
    id: 'claude',
    name: 'Claude',
    icon: 'anthropic',
    description: 'Anthropic AI Assistant',
  };

  /**
   * Execute OAuth authorization flow
   */
  async authorize(): Promise<{ tokens: OAuthTokens; profile: OAuthProfile }> {
    const result = await authorizeWithAnthropic();

    // Fetch user profile
    let profile: OAuthProfile;
    try {
      const profileData = await getUserProfile(result.accessToken);
      profile = {
        id: 'claude-user',
        email: profileData.email,
        name: profileData.name,
      };
    } catch {
      // Profile fetch failed, use minimal profile
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
    const result = await refreshAccessToken(refreshToken);
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
