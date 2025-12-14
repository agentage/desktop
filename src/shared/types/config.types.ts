/**
 * External token configuration for OAuth providers
 */
export interface ExternalToken {
  provider: 'github' | 'gitlab' | 'bitbucket';
  scope: string[];
  value: string;
  username?: string;
  connectedAt: string;
}

/**
 * User information stored in config
 */
export interface UserInfo {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  verifiedAlias?: string;
}

/**
 * Auth configuration stored in config
 */
export interface AuthConfig {
  token: string;
  expiresAt?: string;
  user?: UserInfo;
}

/**
 * Registry configuration
 */
export interface RegistryConfig {
  url: string;
}

/**
 * Complete app configuration structure
 */
export interface AppConfig {
  auth?: AuthConfig;
  registry?: RegistryConfig;
  deviceId?: string;
  tokens?: ExternalToken[];
}
