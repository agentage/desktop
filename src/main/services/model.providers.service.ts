import type {
  LoadProvidersResult,
  ModelInfo,
  ModelProviderConfig,
  ModelProviderType,
  SaveProviderRequest,
  SaveProviderResult,
  TokenSource,
  ValidateTokenResponse,
} from '../../shared/types/index.js';
import {
  loadModelsConfig,
  resolveProviderToken,
  saveModelsConfig,
} from './models.storage.service.js';

/**
 * Fallback Anthropic models (used if API fails to list models)
 */
const ANTHROPIC_FALLBACK_MODELS: ModelInfo[] = [
  { id: 'claude-opus-4-20250514', displayName: 'Claude Opus 4', enabled: false },
  { id: 'claude-sonnet-4-20250514', displayName: 'Claude Sonnet 4', enabled: false },
  { id: 'claude-3-7-sonnet-20250219', displayName: 'Claude 3.7 Sonnet', enabled: false },
  { id: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet', enabled: false },
  { id: 'claude-3-5-haiku-20241022', displayName: 'Claude 3.5 Haiku', enabled: false },
  { id: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus', enabled: false },
  { id: 'claude-3-haiku-20240307', displayName: 'Claude 3 Haiku', enabled: false },
];

/**
 * Fallback OpenAI models for ChatGPT OAuth tokens
 * Based on Codex CLI's embedded models.json - these are the primary models available
 * when using ChatGPT authentication. The backend /models endpoint may not be accessible
 * to all users, so we provide these defaults.
 */
const OPENAI_CHATGPT_FALLBACK_MODELS: ModelInfo[] = [
  { id: 'gpt-5.2-codex', displayName: 'gpt-5.2-codex', enabled: false },
  { id: 'gpt-5.1-codex-max', displayName: 'gpt-5.1-codex-max', enabled: false },
  { id: 'gpt-5.1-codex-mini', displayName: 'gpt-5.1-codex-mini', enabled: false },
  { id: 'gpt-5.2', displayName: 'gpt-5.2', enabled: false },
  { id: 'gpt-5.1', displayName: 'gpt-5.1', enabled: false },
  { id: 'gpt-5', displayName: 'gpt-5', enabled: false },
  { id: 'o4-mini', displayName: 'o4-mini', enabled: false },
  { id: 'o3', displayName: 'o3', enabled: false },
  { id: 'gpt-4.1', displayName: 'gpt-4.1', enabled: false },
  { id: 'gpt-4o', displayName: 'gpt-4o', enabled: false },
];

/**
 * Fallback OpenAI models for API keys (public API)
 */
const OPENAI_API_FALLBACK_MODELS: ModelInfo[] = [
  { id: 'gpt-4.1', displayName: 'gpt-4.1', enabled: false },
  { id: 'gpt-4o', displayName: 'gpt-4o', enabled: false },
  { id: 'gpt-4o-mini', displayName: 'gpt-4o-mini', enabled: false },
  { id: 'o3', displayName: 'o3', enabled: false },
  { id: 'o4-mini', displayName: 'o4-mini', enabled: false },
  { id: 'gpt-4-turbo', displayName: 'gpt-4-turbo', enabled: false },
  { id: 'gpt-3.5-turbo', displayName: 'gpt-3.5-turbo', enabled: false },
];

/**
 * Validate a provider token by making a test request
 */
export const validateToken = async (
  provider: ModelProviderType,
  token: string
): Promise<ValidateTokenResponse> => {
  try {
    if (provider === 'openai') {
      return await validateOpenAIToken(token);
    }
    return await validateAnthropicToken(token);
  } catch {
    return { valid: false, error: 'network_error' };
  }
};

/**
 * Check if token is a JWT (OAuth token from ChatGPT)
 */
const isJWTToken = (token: string): boolean => token.startsWith('eyJ');

/**
 * Extract account_id from JWT access token
 * Tries: 1) 'acc' claim at root, 2) 'chatgpt_account_id' under auth claims
 */
const extractAccountIdFromJWT = (token: string): string | undefined => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return undefined;

    // Handle URL-safe base64
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString()) as {
      acc?: string;
      'https://api.openai.com/auth'?: {
        chatgpt_account_id?: string;
      };
    };

    // Try 'acc' at root first (personal accounts), then chatgpt_account_id (org accounts)
    return payload.acc ?? payload['https://api.openai.com/auth']?.chatgpt_account_id;
  } catch {
    return undefined;
  }
};

/**
 * Fetch models from ChatGPT backend API (for OAuth JWT tokens)
 * This is the same API that Codex CLI uses
 */
const fetchChatGPTModels = async (token: string): Promise<ValidateTokenResponse> => {
  try {
    // Extract account ID from JWT token
    const accountId = extractAccountIdFromJWT(token);

    // client_version is required - use stable released version
    const clientVersion = '0.77.0';

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      originator: 'codex_cli_rs',
      'User-Agent': `codex_cli_rs/${clientVersion} (Linux; x86_64)`,
    };

    // Add ChatGPT-Account-ID header if available (required for API access)
    if (accountId) {
      headers['ChatGPT-Account-ID'] = accountId;
    }

    const response = await fetch(
      `https://chatgpt.com/backend-api/codex/models?client_version=${clientVersion}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'invalid_token' };
    }

    // 404 means the /models endpoint is not available for this account
    // This is expected for some accounts - use fallback models instead
    if (response.status === 404) {
      return { valid: true, models: OPENAI_CHATGPT_FALLBACK_MODELS };
    }

    if (!response.ok) {
      // For other errors, still return valid with fallback models
      // The token is valid (not 401/403), just the models endpoint has issues
      return { valid: true, models: OPENAI_CHATGPT_FALLBACK_MODELS };
    }

    // ChatGPT backend API returns models with 'slug' and 'display_name' fields
    const data = (await response.json()) as {
      models?: {
        slug: string;
        display_name: string;
        description?: string;
        priority?: number;
      }[];
      etag?: string;
    };

    const models: ModelInfo[] =
      data.models
        ?.map((m) => ({
          id: m.slug,
          displayName: m.display_name,
          enabled: false,
        }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName)) ?? [];

    return { valid: true, models: models.length > 0 ? models : OPENAI_CHATGPT_FALLBACK_MODELS };
  } catch {
    // Network errors shouldn't invalidate the token - use fallback models
    return { valid: true, models: OPENAI_CHATGPT_FALLBACK_MODELS };
  }
};

/**
 * Fetch models from public OpenAI API (for API keys)
 */
const fetchOpenAIPublicModels = async (token: string): Promise<ValidateTokenResponse> => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      return { valid: false, error: 'invalid_token' };
    }

    if (!response.ok) {
      // For non-auth errors, use fallback models
      return { valid: true, models: OPENAI_API_FALLBACK_MODELS };
    }

    const data = (await response.json()) as { data?: { id: string; created?: number }[] };

    const models: ModelInfo[] =
      data.data
        ?.filter(
          (m) =>
            m.id.startsWith('gpt-') ||
            m.id.startsWith('o1') ||
            m.id.startsWith('o3') ||
            m.id.startsWith('o4')
        )
        .map((m) => ({
          id: m.id,
          displayName: m.id,
          createdAt: m.created ? new Date(m.created * 1000).toISOString() : undefined,
          enabled: false,
        }))
        .sort((a, b) => a.id.localeCompare(b.id)) ?? [];

    // If API returned no matching models, use fallback
    return { valid: true, models: models.length > 0 ? models : OPENAI_API_FALLBACK_MODELS };
  } catch {
    // Network errors shouldn't invalidate the token - use fallback models
    return { valid: true, models: OPENAI_API_FALLBACK_MODELS };
  }
};

/**
 * Validate OpenAI token by fetching models list
 * Uses ChatGPT backend API for JWT tokens (OAuth), public API for API keys
 */
const validateOpenAIToken = async (token: string): Promise<ValidateTokenResponse> => {
  // JWT tokens (from OAuth) use ChatGPT backend API
  if (isJWTToken(token)) {
    return fetchChatGPTModels(token);
  }

  // API keys (sk-...) use public OpenAI API
  return fetchOpenAIPublicModels(token);
};

/**
 * Validate Anthropic token by making a minimal API call
 */
const validateAnthropicToken = async (token: string): Promise<ValidateTokenResponse> => {
  // Detect token type from prefix
  const isOAuthToken = token.startsWith('sk-ant-oat');
  const isJWT = token.startsWith('eyJ');

  if (isJWT) {
    return { valid: false, error: 'invalid_token' };
  }

  try {
    // First, try to fetch models - this also validates the token
    const headers: Record<string, string> = {
      'anthropic-version': '2023-06-01',
    };

    if (isOAuthToken) {
      headers.Authorization = `Bearer ${token}`;
      headers['anthropic-beta'] = 'oauth-2025-04-20';
    } else {
      headers['x-api-key'] = token;
    }

    // Try the models endpoint first - it validates the token AND gives us models
    const modelsResponse = await fetch('https://api.anthropic.com/v1/models', {
      method: 'GET',
      headers,
    });

    if (modelsResponse.status === 401) {
      return { valid: false, error: 'invalid_token' };
    }

    if (modelsResponse.ok) {
      const data = (await modelsResponse.json()) as {
        data?: { id: string; display_name: string; created_at: string; type: string }[];
      };

      if (data.data && data.data.length > 0) {
        const models: ModelInfo[] = data.data
          .filter((m) => m.type === 'model')
          .map((m) => ({
            id: m.id,
            displayName: m.display_name,
            createdAt: m.created_at,
            enabled: false,
          }));
        return { valid: true, models };
      }
    }

    // Fallback: validate with messages endpoint if models endpoint fails
    headers['Content-Type'] = 'application/json';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    });

    if (response.status === 401) {
      return { valid: false, error: 'invalid_token' };
    }

    if (response.status === 200 || response.status === 429 || response.status === 400) {
      return { valid: true, models: ANTHROPIC_FALLBACK_MODELS };
    }

    return { valid: false, error: 'network_error' };
  } catch {
    return { valid: false, error: 'network_error' };
  }
};

/**
 * Check if models were fetched more than 1 day ago
 */
const isStale = (lastFetchedAt?: string): boolean => {
  if (!lastFetchedAt) return true;
  const lastFetched = new Date(lastFetchedAt).getTime();
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return lastFetched < oneDayAgo;
};

/**
 * Load saved model providers configuration from models.json
 * If autoRefresh is true, re-fetch models from API for providers where lastFetchedAt > 1 day
 * Also auto-detects OAuth connections that aren't yet in models.json
 */
export const loadProviders = async (autoRefresh = false): Promise<LoadProvidersResult> => {
  const config = await loadModelsConfig();
  let providers = [...config.providers];
  let configChanged = false;

  // Auto-detect OAuth connections that aren't in models.json yet
  const oauthProviders: { oauthId: 'codex' | 'claude'; modelProvider: ModelProviderType }[] = [
    { oauthId: 'codex', modelProvider: 'openai' },
    { oauthId: 'claude', modelProvider: 'anthropic' },
  ];

  for (const { oauthId, modelProvider } of oauthProviders) {
    const existingProvider = providers.find((p) => p.provider === modelProvider);
    const existingIndex = providers.findIndex((p) => p.provider === modelProvider);

    // Check if OAuth is connected by directly reading OAuth storage
    const { OAuthStorage } = await import('./oauth/oauth-storage.service.js');
    const oauthStorage = new OAuthStorage();
    const oauthData = await oauthStorage.getProvider(oauthId);

    if (!oauthData?.tokens.accessToken) continue;

    // OAuth is connected - check if we need to add or update the provider
    const source: TokenSource = oauthId === 'codex' ? 'oauth:codex' : 'oauth:claude';

    // If provider exists but is set to manual source, update it to use OAuth
    if (existingProvider && existingProvider.source === 'manual') {
      const token = oauthData.tokens.accessToken;
      const result = await validateToken(modelProvider, token);

      const updatedProvider: ModelProviderConfig = {
        ...existingProvider,
        source,
        token: undefined, // Clear manual token
        enabled: true,
        models: result.valid && result.models ? result.models : existingProvider.models,
        lastFetchedAt: new Date().toISOString(),
      };
      providers[existingIndex] = updatedProvider;
      configChanged = true;
      continue;
    }

    // Skip if provider already exists with OAuth source
    if (existingProvider) continue;

    // OAuth is connected but not in models.json - add it
    const token = oauthData.tokens.accessToken;

    // Validate token and fetch models
    const result = await validateToken(modelProvider, token);
    const newProvider: ModelProviderConfig = {
      provider: modelProvider,
      source,
      enabled: true,
      models: result.valid && result.models ? result.models : [],
      lastFetchedAt: new Date().toISOString(),
    };
    providers.push(newProvider);
    configChanged = true;
  }

  // Save newly detected OAuth providers
  if (configChanged) {
    await saveModelsConfig({ providers });
  }

  if (autoRefresh && providers.length > 0) {
    const updatedProviders: ModelProviderConfig[] = [];
    let refreshConfigChanged = false;

    for (const providerConfig of providers) {
      // Resolve token (handles OAuth)
      const token = await resolveProviderToken(providerConfig.provider);
      if (!token) {
        updatedProviders.push(providerConfig);
        continue;
      }

      // Check if models need refresh
      if (isStale(providerConfig.lastFetchedAt)) {
        const result = await validateToken(providerConfig.provider, token);

        if (result.valid && result.models) {
          // Preserve enabled state from existing models
          const updatedModels = result.models.map((newModel) => {
            const existing = providerConfig.models.find((m: ModelInfo) => m.id === newModel.id);
            return {
              ...newModel,
              enabled: existing?.enabled ?? newModel.enabled,
              isDefault: existing?.isDefault ?? newModel.isDefault,
            };
          });

          updatedProviders.push({
            ...providerConfig,
            models: updatedModels,
            lastFetchedAt: new Date().toISOString(),
          });
          refreshConfigChanged = true;
        } else {
          // Keep existing config if refresh failed
          updatedProviders.push(providerConfig);
        }
      } else {
        updatedProviders.push(providerConfig);
      }
    }

    // Save updated config if any providers were refreshed
    if (refreshConfigChanged) {
      await saveModelsConfig({ providers: updatedProviders });
    }

    providers = updatedProviders;
  }

  return { providers };
};

/**
 * Save a model provider configuration
 */
export const saveProvider = async (request: SaveProviderRequest): Promise<SaveProviderResult> => {
  try {
    const config = await loadModelsConfig();
    const providers = config.providers;

    // Find existing provider
    const existingIndex = providers.findIndex((p) => p.provider === request.provider);

    const providerConfig: ModelProviderConfig = {
      provider: request.provider,
      source: request.source,
      token: request.source === 'manual' ? request.token : undefined,
      enabled: request.enabled,
      lastFetchedAt: request.lastFetchedAt,
      models: request.models,
    };

    if (existingIndex >= 0) {
      providers[existingIndex] = providerConfig;
    } else {
      providers.push(providerConfig);
    }

    await saveModelsConfig({ providers });
    return { success: true };
  } catch (error) {
    console.error('Failed to save provider:', error);
    return { success: false, error: 'Failed to save configuration' };
  }
};

/**
 * Get resolved token for a provider (handles OAuth)
 * Re-exported for use by other services
 */
export { resolveProviderToken } from './models.storage.service.js';
