/**
 * API Keys types for LLM provider management
 */

/**
 * Supported LLM providers
 */
export type KeyProvider = 'anthropic' | 'openai';

/**
 * Request to validate an API key
 */
export interface ValidateKeyRequest {
  provider: KeyProvider;
  key: string;
}

/**
 * Validation error types
 */
export type KeyValidationError = 'invalid_key' | 'network_error' | 'oauth_token';

/**
 * Response from key validation
 */
export interface ValidateKeyResponse {
  valid: boolean;
  models?: string[];
  error?: KeyValidationError;
}

/**
 * Provider configuration with key and enabled models
 */
export interface ProviderKeyConfig {
  provider: KeyProvider;
  key: string;
  enabledModels: string[];
}

/**
 * Autodiscovered keys result
 */
export interface AutodiscoverResult {
  anthropic?: string;
  openai?: string;
}

/**
 * Loaded keys configuration
 */
export interface LoadKeysResult {
  providers: ProviderKeyConfig[];
}

/**
 * Save key result
 */
export interface SaveKeyResult {
  success: boolean;
  error?: string;
}
