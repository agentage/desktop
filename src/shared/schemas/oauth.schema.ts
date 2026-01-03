import { z } from 'zod';

/**
 * OAuth provider identifiers
 */
export const oAuthProviderIdSchema = z.enum(['openai', 'anthropic']);

/**
 * OAuth tokens schema
 */
export const oAuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().nullable().optional(),
  idToken: z.string().nullable().optional(),
  expiresAt: z.number().nullable().optional(),
  scopes: z.array(z.string()).optional(),
});

/**
 * OAuth profile schema
 */
export const oAuthProfileSchema = z.object({
  id: z.string(),
  email: z.string().optional(),
  name: z.string().optional(),
  avatar: z.url().optional(),
});

/**
 * OAuth provider data schema
 */
export const oAuthProviderDataSchema = z.object({
  tokens: oAuthTokensSchema,
  profile: oAuthProfileSchema,
  connectedAt: z.number(),
});

/**
 * OAuth storage data schema
 */
export const oAuthStorageDataSchema = z.object({
  providers: z.partialRecord(oAuthProviderIdSchema, oAuthProviderDataSchema).default({}),
});

/**
 * OAuth connect request schema
 */
export const oAuthConnectRequestSchema = z.object({
  providerId: oAuthProviderIdSchema,
});

/**
 * OAuth disconnect request schema
 */
export const oAuthDisconnectRequestSchema = z.object({
  providerId: oAuthProviderIdSchema,
});
