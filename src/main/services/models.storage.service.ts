import { mkdir, readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import { z } from 'zod';
import type {
  ModelProviderConfig,
  ModelProviderType,
  ModelsConfig,
  TokenSource,
} from '../../shared/types/index.js';
import { OAuthStorage } from './oauth/oauth-storage.service.js';

const CONFIG_DIR = join(homedir(), '.agentage');
const MODELS_FILE = join(CONFIG_DIR, 'models.json');

/**
 * Model info schema
 */
const modelInfoSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  createdAt: z.string().optional(),
  enabled: z.boolean().default(false),
  isDefault: z.boolean().optional(),
});

/**
 * Token source schema
 */
const tokenSourceSchema = z.enum(['manual', 'oauth:codex', 'oauth:claude']);

/**
 * Model provider config schema for models.json
 */
const modelProviderConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic']),
  source: tokenSourceSchema,
  token: z.string().optional(),
  enabled: z.boolean().default(true),
  lastFetchedAt: z.string().optional(),
  models: z.array(modelInfoSchema).default([]),
});

/**
 * Models config schema
 */
const modelsConfigSchema = z.object({
  providers: z.array(modelProviderConfigSchema).default([]),
});

const DEFAULT_CONFIG: ModelsConfig = {
  providers: [],
};

/**
 * Load models config from ~/.agentage/models.json
 */
export const loadModelsConfig = async (): Promise<ModelsConfig> => {
  try {
    const content = await readFile(MODELS_FILE, 'utf-8');
    const parsed = JSON.parse(content) as unknown;
    return modelsConfigSchema.parse(parsed);
  } catch {
    return DEFAULT_CONFIG;
  }
};

/**
 * Save models config to ~/.agentage/models.json
 */
export const saveModelsConfig = async (config: ModelsConfig): Promise<void> => {
  await mkdir(CONFIG_DIR, { recursive: true });
  const validated = modelsConfigSchema.parse(config);
  await writeFile(MODELS_FILE, JSON.stringify(validated, null, 2), 'utf-8');
};

/**
 * Get a single provider config
 */
export const getProviderConfig = async (
  provider: ModelProviderType
): Promise<ModelProviderConfig | undefined> => {
  const config = await loadModelsConfig();
  return config.providers.find((p) => p.provider === provider);
};

/**
 * Save a single provider config
 */
export const saveProviderConfig = async (providerConfig: ModelProviderConfig): Promise<void> => {
  const config = await loadModelsConfig();
  const existingIndex = config.providers.findIndex((p) => p.provider === providerConfig.provider);

  if (existingIndex >= 0) {
    config.providers[existingIndex] = providerConfig;
  } else {
    config.providers.push(providerConfig);
  }

  await saveModelsConfig(config);
};

/**
 * Map OAuth provider ID to TokenSource
 */
const oauthProviderToSource = (oauthProviderId: string): TokenSource | null => {
  switch (oauthProviderId) {
    case 'codex':
      return 'oauth:codex';
    case 'claude':
      return 'oauth:claude';
    default:
      return null;
  }
};

/**
 * Map TokenSource to OAuth provider ID
 */
const sourceToOAuthProvider = (source: TokenSource): string | null => {
  if (source === 'manual') return null;
  return source.replace('oauth:', '');
};

/**
 * Map OAuth provider ID to model provider type
 */
export const oauthProviderToModelProvider = (
  oauthProviderId: string
): ModelProviderType | null => {
  switch (oauthProviderId) {
    case 'codex':
      return 'openai';
    case 'claude':
      return 'anthropic';
    default:
      return null;
  }
};

/**
 * Map model provider type to OAuth provider ID
 */
export const modelProviderToOAuthProvider = (provider: ModelProviderType): string => {
  switch (provider) {
    case 'openai':
      return 'codex';
    case 'anthropic':
      return 'claude';
  }
};

/**
 * Resolve token for a provider - handles OAuth token resolution
 */
export const resolveProviderToken = async (
  provider: ModelProviderType
): Promise<string | null> => {
  const config = await getProviderConfig(provider);
  if (!config) return null;

  if (config.source === 'manual') {
    return config.token ?? null;
  }

  // OAuth source - read from oauth.json
  const oauthProviderId = sourceToOAuthProvider(config.source);
  if (!oauthProviderId) return null;

  const oauthStorage = new OAuthStorage();
  const oauthData = await oauthStorage.getProvider(oauthProviderId as 'claude' | 'codex');

  return oauthData?.tokens.accessToken ?? null;
};

/**
 * Check if a provider is connected via OAuth
 */
export const isOAuthConnected = async (provider: ModelProviderType): Promise<boolean> => {
  const oauthProviderId = modelProviderToOAuthProvider(provider);
  const oauthStorage = new OAuthStorage();
  const oauthData = await oauthStorage.getProvider(oauthProviderId as 'claude' | 'codex');
  return oauthData !== undefined;
};

/**
 * Update models.json source when OAuth connects
 */
export const setOAuthSource = async (
  oauthProviderId: string,
  models: { id: string; displayName: string; enabled: boolean }[]
): Promise<void> => {
  const modelProvider = oauthProviderToModelProvider(oauthProviderId);
  if (!modelProvider) return;

  const source = oauthProviderToSource(oauthProviderId);
  if (!source) return;

  const config = await loadModelsConfig();
  const existingIndex = config.providers.findIndex((p) => p.provider === modelProvider);

  const providerConfig: ModelProviderConfig = {
    provider: modelProvider,
    source,
    enabled: true,
    models,
    lastFetchedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    // Preserve existing model enabled states
    const existing = config.providers[existingIndex];
    providerConfig.models = models.map((m) => {
      const existingModel = existing.models.find((em) => em.id === m.id);
      return {
        ...m,
        enabled: existingModel?.enabled ?? m.enabled,
        isDefault: existingModel?.isDefault,
      };
    });
    config.providers[existingIndex] = providerConfig;
  } else {
    config.providers.push(providerConfig);
  }

  await saveModelsConfig(config);
};

/**
 * Clear OAuth source when disconnecting
 */
export const clearOAuthSource = async (oauthProviderId: string): Promise<void> => {
  const modelProvider = oauthProviderToModelProvider(oauthProviderId);
  if (!modelProvider) return;

  const config = await loadModelsConfig();
  const existingIndex = config.providers.findIndex((p) => p.provider === modelProvider);

  if (existingIndex >= 0) {
    // Remove the provider entry entirely
    config.providers.splice(existingIndex, 1);
    await saveModelsConfig(config);
  }
};
