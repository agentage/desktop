import { z } from 'zod';

/**
 * Model provider schema
 */
export const modelProviderSchema = z.object({
  id: z.string(),
  provider: z.enum(['openai', 'anthropic', 'ollama', 'custom']),
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  defaultModel: z.string().optional(),
  isDefault: z.boolean().optional(),
});

/**
 * Synced settings schema
 */
export const syncedSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  defaultModelProvider: z.string().optional(),
  logRetention: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(-1)]).default(30),
  language: z.string().default('en'),
});

/**
 * Settings schema (complete)
 */
export const settingsSchema = z.object({
  models: z.array(modelProviderSchema).default([]),
  backendUrl: z.string().url().default('https://agentage.io'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  defaultModelProvider: z.string().optional(),
  logRetention: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(-1)]).default(30),
  language: z.string().default('en'),
});
