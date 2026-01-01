/**
 * OAuth types for external service connections
 */

/**
 * OAuth provider identifiers
 */
export type OAuthProviderId = 'openai' | 'anthropic';

/**
 * OAuth tokens structure
 */
export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string | null;
  idToken?: string | null;
  expiresAt?: number | null;
  scopes?: string[];
}

/**
 * User profile from OAuth provider
 */
export interface OAuthProfile {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
}

/**
 * Provider data stored in oauth.json
 */
export interface OAuthProviderData {
  tokens: OAuthTokens;
  profile: OAuthProfile;
  connectedAt: number;
}

/**
 * Complete OAuth storage structure
 */
export interface OAuthStorageData {
  providers: Partial<Record<OAuthProviderId, OAuthProviderData>>;
}

/**
 * Provider status returned to UI
 */
export interface OAuthProviderStatus {
  id: OAuthProviderId;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  profile?: OAuthProfile;
  expiresAt?: number;
  isExpired?: boolean;
}

/**
 * Result from oauth:list
 */
export interface OAuthListResult {
  providers: OAuthProviderStatus[];
}

/**
 * Request for oauth:connect
 */
export interface OAuthConnectRequest {
  providerId: OAuthProviderId;
}

/**
 * Result from oauth:connect
 */
export interface OAuthConnectResult {
  success: boolean;
  profile?: OAuthProfile;
  error?: string;
}

/**
 * Request for oauth:disconnect
 */
export interface OAuthDisconnectRequest {
  providerId: OAuthProviderId;
}

/**
 * Result from oauth:disconnect
 */
export interface OAuthDisconnectResult {
  success: boolean;
  error?: string;
}
