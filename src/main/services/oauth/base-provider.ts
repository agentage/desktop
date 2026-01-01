import type { OAuthProfile, OAuthTokens } from '../../../shared/types/oauth.types.js';

/**
 * OAuth provider configuration
 */
export interface OAuthProviderConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
}

/**
 * OAuth provider interface
 */
export interface OAuthProvider {
  readonly config: OAuthProviderConfig;

  /**
   * Execute OAuth flow - opens browser, handles callback
   */
  authorize(): Promise<{ tokens: OAuthTokens; profile: OAuthProfile }>;

  /**
   * Refresh expired access token
   */
  refreshToken(refreshToken: string): Promise<OAuthTokens>;

  /**
   * Check if tokens are expired
   */
  isExpired(tokens: OAuthTokens): boolean;

  /**
   * Fetch user profile from provider
   */
  fetchProfile(accessToken: string): Promise<OAuthProfile>;
}
