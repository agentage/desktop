import { z } from 'zod';

/**
 * User schema - compatible with CLI
 */
export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().optional(),
  avatar: z.url().optional(),
  verifiedAlias: z.string().optional(),
});

/**
 * Auth state schema - compatible with CLI
 * Note: expiresAt is ISO datetime string
 */
export const authStateSchema = z.object({
  token: z.string(),
  expiresAt: z.iso.datetime().optional(),
  user: userSchema.optional(),
});

export type UserSchema = z.infer<typeof userSchema>;
export type AuthStateSchema = z.infer<typeof authStateSchema>;
