/**
 * Model Providers types for LLM provider management
 */

/**
 * Supported LLM providers
 */
export type ModelProviderType = 'anthropic' | 'openai';

/**
 * Token source - manual entry or OAuth connection
 */
export type TokenSource = 'manual' | 'oauth:openai' | 'oauth:anthropic';

/**
 * Model information from API
 */
export interface ModelInfo {
  id: string;
  displayName: string;
  createdAt?: string;
  enabled: boolean;
  isDefault?: boolean;
}

/**
 * Model provider configuration stored in models.json
 */
export interface ModelProviderConfig {
  provider: ModelProviderType;
  source: TokenSource;
  token?: string; // Only when source === 'manual'
  enabled: boolean;
  lastFetchedAt?: string;
  models: ModelInfo[];
}

/**
 * Models config file structure (~/.agentage/models.json)
 */
export interface ModelsConfig {
  providers: ModelProviderConfig[];
}

/**
 * Request to validate a provider token
 */
export interface ValidateTokenRequest {
  provider: ModelProviderType;
  token: string;
}

/**
 * Validation error types
 */
export type TokenValidationError = 'invalid_token' | 'network_error';

/**
 * Response from token validation - includes models from API
 */
export interface ValidateTokenResponse {
  valid: boolean;
  models?: ModelInfo[];
  error?: TokenValidationError;
}

/**
 * Request to save a provider configuration
 */
export interface SaveProviderRequest {
  provider: ModelProviderType;
  source: TokenSource;
  token?: string; // Only when source === 'manual'
  enabled: boolean;
  lastFetchedAt?: string;
  models: ModelInfo[];
}

/**
 * Result from save operation
 */
export interface SaveProviderResult {
  success: boolean;
  error?: string;
}

/**
 * Result from loading all providers
 */
export interface LoadProvidersResult {
  providers: ModelProviderConfig[];
}

/**
 * Request to update model settings for a provider
 */
export interface UpdateModelsRequest {
  provider: ModelProviderType;
  models: ModelInfo[];
}
