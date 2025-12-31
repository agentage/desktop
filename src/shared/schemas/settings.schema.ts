import { z } from 'zod';

/**
 * Model info schema - individual model from API
 */
export const modelInfoSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  createdAt: z.string().optional(),
  enabled: z.boolean().default(false),
  isDefault: z.boolean().optional(),
});

/**
 * Model provider schema - provider with token and models
 */
export const modelProviderConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic']),
  token: z.string(),
  enabled: z.boolean().default(true),
  lastFetchedAt: z.string().optional(),
  models: z.array(modelInfoSchema).default([]),
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
  modelProviders: z.array(modelProviderConfigSchema).default([]),
  backendUrl: z.string().url().default('https://agentage.io'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  defaultModelProvider: z.string().optional(),
  logRetention: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(-1)]).default(30),
  language: z.string().default('en'),
});
