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
 * Model provider configuration (for settings system)
 */
export interface ModelProvider {
  id: string;
  provider: 'openai' | 'anthropic' | 'ollama' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  isDefault?: boolean;
}

/**
 * Synced settings (stored on backend)
 */
export interface SyncedSettings {
  theme: 'light' | 'dark' | 'system';
  defaultModelProvider?: string;
  logRetention: 7 | 30 | 90 | -1;
  language: string;
  composer?: ComposerSettings;
}

/**
 * Composer UI customization settings
 */
export interface ComposerSettings {
  fontSize: 'small' | 'medium' | 'large';
  iconSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'relaxed';
  accentColor: string;
}

/**
 * Complete app configuration structure
 */
export interface AppConfig {
  auth?: AuthConfig;
  registry?: RegistryConfig;
  deviceId?: string;
  tokens?: ExternalToken[];
  models?: ModelProvider[];
  modelProviders?: import('./model.providers.types.js').ModelProviderConfig[];
  settings?: SyncedSettings;
}
