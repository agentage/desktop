import { z } from 'zod';

/**
 * Provider enum schema
 */
export const keyProviderSchema = z.enum(['anthropic', 'openai']);

/**
 * Validate key request schema
 */
export const validateKeyRequestSchema = z.object({
  provider: keyProviderSchema,
  key: z.string().min(1, 'API key is required'),
});

/**
 * Validate key response schema
 */
export const validateKeyResponseSchema = z.object({
  valid: z.boolean(),
  models: z.array(z.string()).optional(),
  error: z.enum(['invalid_key', 'network_error']).optional(),
});

/**
 * Provider key config schema
 */
export const providerKeyConfigSchema = z.object({
  provider: keyProviderSchema,
  key: z.string(),
  enabledModels: z.array(z.string()).default([]),
});

/**
 * Autodiscover result schema
 */
export const autodiscoverResultSchema = z.object({
  anthropic: z.string().optional(),
  openai: z.string().optional(),
});

/**
 * Load keys result schema
 */
export const loadKeysResultSchema = z.object({
  providers: z.array(providerKeyConfigSchema).default([]),
});

/**
 * Save key request schema
 */
export const saveKeyRequestSchema = z.object({
  provider: keyProviderSchema,
  key: z.string(),
  enabledModels: z.array(z.string()).default([]),
});

/**
 * Save key result schema
 */
export const saveKeyResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
