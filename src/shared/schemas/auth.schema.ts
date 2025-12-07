import { z } from 'zod';

/**
 * User schema - compatible with CLI
 */
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  avatar: z.string().url().optional(),
  verifiedAlias: z.string().optional(),
});

/**
 * Auth state schema - compatible with CLI
 * Note: expiresAt is ISO datetime string
 */
export const authStateSchema = z.object({
  token: z.string(),
  expiresAt: z.string().datetime().optional(),
  user: userSchema.optional(),
});

export type UserSchema = z.infer<typeof userSchema>;
export type AuthStateSchema = z.infer<typeof authStateSchema>;
