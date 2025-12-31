/**
 * Model Providers types for LLM provider management
 */

/**
 * Supported LLM providers
 */
export type ModelProviderType = 'anthropic' | 'openai';

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
 * Model provider configuration stored in config
 */
export interface ModelProviderConfig {
  provider: ModelProviderType;
  token: string;
  enabled: boolean;
  lastFetchedAt?: string;
  models: ModelInfo[];
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
  token: string;
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
