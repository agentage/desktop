import { mkdir, readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import { z } from 'zod';
import { syncedSettingsSchema } from '../../shared/schemas/index.js';
import type {
  AppConfig,
  ExternalToken,
  Settings,
  SyncedSettings,
} from '../../shared/types/index.js';

const CONFIG_DIR = join(homedir(), '.agentage');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

/**
 * User schema - compatible with CLI
 */
const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().optional(),
  avatar: z.url().optional(),
  verifiedAlias: z.string().optional(),
});

/**
 * Auth config schema - compatible with CLI
 * Note: expiresAt is ISO string (CLI format), not number
 */
const authConfigSchema = z.object({
  token: z.string(),
  expiresAt: z.iso.datetime().optional(),
  user: userSchema.optional(),
});

/**
 * External token schema for OAuth providers (GitHub, GitLab, Bitbucket)
 */
const externalTokenSchema = z.object({
  provider: z.enum(['github', 'gitlab', 'bitbucket']),
  scope: z.array(z.string()),
  value: z.string(),
  username: z.string().optional(),
  connectedAt: z.iso.datetime(),
});

/**
 * Registry config schema - compatible with CLI
 */
const registryConfigSchema = z.object({
  url: z.url().default('https://dev.agentage.io'),
});

/**
 * Model provider schema for settings system
 */
const modelProviderSchema = z.object({
  id: z.string(),
  provider: z.enum(['openai', 'anthropic', 'ollama', 'custom']),
  apiKey: z.string().optional(),
  baseUrl: z.url().optional(),
  defaultModel: z.string().optional(),
  isDefault: z.boolean().optional(),
});

/**
 * Complete config schema - compatible with CLI ~/.agentage/config.json
 * Note: modelProviders moved to ~/.agentage/models.json
 */
export const configSchema = z.object({
  auth: authConfigSchema.optional(),
  registry: registryConfigSchema.optional(),
  deviceId: z.string().optional(),
  tokens: z.array(externalTokenSchema).default([]),
  models: z.array(modelProviderSchema).default([]),
  settings: syncedSettingsSchema.optional(),
});

export type { AppConfig, ExternalToken };

const DEFAULT_CONFIG: AppConfig = {
  tokens: [],
};

const DEFAULT_SETTINGS: SyncedSettings = {
  theme: 'system',
  logRetention: 30,
  language: 'en',
};

export const loadConfig = async (): Promise<AppConfig> => {
  try {
    const content = await readFile(CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(content) as unknown;
    return configSchema.parse(parsed);
  } catch {
    return DEFAULT_CONFIG;
  }
};

export const saveConfig = async (config: AppConfig): Promise<void> => {
  await mkdir(CONFIG_DIR, { recursive: true });
  const validated = configSchema.parse(config);
  await writeFile(CONFIG_FILE, JSON.stringify(validated, null, 2), 'utf-8');
};

export const getConfigDir = (): string => CONFIG_DIR;

/**
 * Get registry URL from config or default
 */
export const getRegistryUrl = async (): Promise<string> => {
  const config = await loadConfig();
  return config.registry?.url ?? 'https://dev.agentage.io';
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (expiresAt: string | undefined): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt) <= new Date();
};

/**
 * Get external token by provider
 */
export const getExternalToken = async (
  provider: 'github' | 'gitlab' | 'bitbucket'
): Promise<ExternalToken | undefined> => {
  const config = await loadConfig();
  return config.tokens?.find((t) => t.provider === provider);
};

/**
 * Set or update external token
 */
export const setExternalToken = async (token: ExternalToken): Promise<void> => {
  const config = await loadConfig();
  const tokens = config.tokens ?? [];
  const index = tokens.findIndex((t) => t.provider === token.provider);

  if (index >= 0) {
    tokens[index] = token;
  } else {
    tokens.push(token);
  }

  await saveConfig({ ...config, tokens });
};

/**
 * Remove external token by provider
 */
export const removeExternalToken = async (
  provider: 'github' | 'gitlab' | 'bitbucket'
): Promise<void> => {
  const config = await loadConfig();
  const tokens = (config.tokens ?? []).filter((t) => t.provider !== provider);
  await saveConfig({ ...config, tokens });
};

/**
 * Get settings (combines local and synced settings)
 */
export const getSettings = async (): Promise<Settings> => {
  const config = await loadConfig();
  const settings = config.settings ?? DEFAULT_SETTINGS;

  return {
    models: config.models ?? [],
    backendUrl: config.registry?.url ?? 'https://agentage.io',
    theme: settings.theme,
    defaultModelProvider: settings.defaultModelProvider,
    logRetention: settings.logRetention,
    language: settings.language,
  };
};

/**
 * Update settings (updates both local and synced)
 */
export const updateSettings = async (updates: Partial<Settings>): Promise<void> => {
  const config = await loadConfig();

  const updatedConfig: AppConfig = {
    ...config,
    models: updates.models ?? config.models,
    registry: updates.backendUrl ? { url: updates.backendUrl } : config.registry,
    settings: {
      ...(config.settings ?? DEFAULT_SETTINGS),
      theme: updates.theme ?? config.settings?.theme ?? DEFAULT_SETTINGS.theme,
      defaultModelProvider: updates.defaultModelProvider ?? config.settings?.defaultModelProvider,
      logRetention:
        updates.logRetention ?? config.settings?.logRetention ?? DEFAULT_SETTINGS.logRetention,
      language: updates.language ?? config.settings?.language ?? DEFAULT_SETTINGS.language,
    },
  };

  await saveConfig(updatedConfig);
};
