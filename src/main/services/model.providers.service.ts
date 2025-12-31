import type {
  LoadProvidersResult,
  ModelInfo,
  ModelProviderConfig,
  ModelProviderType,
  SaveProviderRequest,
  SaveProviderResult,
  ValidateTokenResponse,
} from '../../shared/types/index.js';
import { loadConfig, saveConfig } from './config.service.js';

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
 * Validate OpenAI token by fetching models list
 */
const validateOpenAIToken = async (token: string): Promise<ValidateTokenResponse> => {
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
      return { valid: false, error: 'network_error' };
    }

    const data = (await response.json()) as { data?: { id: string; created?: number }[] };
    const models: ModelInfo[] =
      data.data
        ?.filter((m) => m.id.startsWith('gpt-') || m.id.startsWith('o1') || m.id.startsWith('o3'))
        .map((m) => ({
          id: m.id,
          displayName: m.id,
          createdAt: m.created ? new Date(m.created * 1000).toISOString() : undefined,
          enabled: false,
        }))
        .sort((a, b) => a.id.localeCompare(b.id)) ?? [];

    return { valid: true, models };
  } catch {
    return { valid: false, error: 'network_error' };
  }
};

/**
 * Validate Anthropic token by making a minimal API call
 */
const validateAnthropicToken = async (token: string): Promise<ValidateTokenResponse> => {
  console.log('[Anthropic] Validating token, prefix:', token.substring(0, 10) + '...');

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

    console.log('[Anthropic] Models API status:', modelsResponse.status);

    if (modelsResponse.status === 401) {
      return { valid: false, error: 'invalid_token' };
    }

    if (modelsResponse.ok) {
      const data = (await modelsResponse.json()) as {
        data?: { id: string; display_name: string; created_at: string; type: string }[];
      };

      console.log('[Anthropic] Models API response data:', JSON.stringify(data, null, 2));

      if (data.data && data.data.length > 0) {
        const models: ModelInfo[] = data.data
          .filter((m) => m.type === 'model')
          .map((m) => ({
            id: m.id,
            displayName: m.display_name,
            createdAt: m.created_at,
            enabled: false,
          }));
        console.log('[Anthropic] Token validated successfully, models from API:', models);
        return { valid: true, models };
      }
    }

    // Fallback: validate with messages endpoint if models endpoint fails
    console.log('[Anthropic] Models endpoint failed, trying messages endpoint...');
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
      console.log(
        '[Anthropic] Token validated via messages, using fallback models:',
        ANTHROPIC_FALLBACK_MODELS
      );
      return { valid: true, models: ANTHROPIC_FALLBACK_MODELS };
    }

    console.log('[Anthropic] Validation failed with status:', response.status);
    return { valid: false, error: 'network_error' };
  } catch (error) {
    console.log('[Anthropic] Validation error:', error);
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
 * Load saved model providers configuration from config file
 * If autoRefresh is true, re-fetch models from API for providers where lastFetchedAt > 1 day
 */
export const loadProviders = async (autoRefresh = false): Promise<LoadProvidersResult> => {
  const config = await loadConfig();
  let providers = config.modelProviders ?? [];

  if (autoRefresh && providers.length > 0) {
    const updatedProviders: ModelProviderConfig[] = [];
    let configChanged = false;

    for (const providerConfig of providers) {
      // Skip providers without tokens
      if (!providerConfig.token) {
        updatedProviders.push(providerConfig);
        continue;
      }

      // Check if models need refresh
      if (isStale(providerConfig.lastFetchedAt)) {
        console.log(`[loadProviders] Refreshing stale models for ${providerConfig.provider}`);
        const result = await validateToken(providerConfig.provider, providerConfig.token);

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
          configChanged = true;
        } else {
          // Keep existing config if refresh failed
          updatedProviders.push(providerConfig);
        }
      } else {
        updatedProviders.push(providerConfig);
      }
    }

    // Save updated config if any providers were refreshed
    if (configChanged) {
      await saveConfig({ ...config, modelProviders: updatedProviders });
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
    const config = await loadConfig();
    const providers = config.modelProviders ?? [];

    // Find existing provider
    const existingIndex = providers.findIndex((p) => p.provider === request.provider);

    const providerConfig: ModelProviderConfig = {
      provider: request.provider,
      token: request.token,
      enabled: request.enabled,
      lastFetchedAt: request.lastFetchedAt,
      models: request.models,
    };

    if (existingIndex >= 0) {
      providers[existingIndex] = providerConfig;
    } else {
      providers.push(providerConfig);
    }

    await saveConfig({ ...config, modelProviders: providers });
    return { success: true };
  } catch (error) {
    console.error('Failed to save provider:', error);
    return { success: false, error: 'Failed to save configuration' };
  }
};
