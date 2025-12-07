import { mkdir, readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import { z } from 'zod';

const CONFIG_DIR = join(homedir(), '.agentage');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

/**
 * User schema - compatible with CLI
 */
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  avatar: z.string().url().optional(),
  verifiedAlias: z.string().optional(),
});

/**
 * Auth config schema - compatible with CLI
 * Note: expiresAt is ISO string (CLI format), not number
 */
const authConfigSchema = z.object({
  token: z.string(),
  expiresAt: z.string().datetime().optional(),
  user: userSchema.optional(),
});

/**
 * Registry config schema - compatible with CLI
 */
const registryConfigSchema = z.object({
  url: z.string().url().default('https://dev.agentage.io'),
});

/**
 * Complete config schema - compatible with CLI ~/.agentage/config.json
 */
export const configSchema = z.object({
  auth: authConfigSchema.optional(),
  registry: registryConfigSchema.optional(),
  deviceId: z.string().optional(),
});

export type AppConfig = z.infer<typeof configSchema>;

const DEFAULT_CONFIG: AppConfig = {};

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
