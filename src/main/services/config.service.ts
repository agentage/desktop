import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { z } from 'zod';

const CONFIG_DIR = join(homedir(), '.agentage');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export const configSchema = z.object({
  registryUrl: z.string().url().default('https://agentage.io/api'),
  apiToken: z.string().optional(),
  devUrl: z.string().url().default('https://dev.agentage.io'),
  agentsDir: z.string().optional(),
  telemetryEnabled: z.boolean().default(false),
});

export type AppConfig = z.infer<typeof configSchema>;

const DEFAULT_CONFIG: AppConfig = {
  registryUrl: 'https://agentage.io/api',
  devUrl: 'https://dev.agentage.io',
  telemetryEnabled: false,
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
