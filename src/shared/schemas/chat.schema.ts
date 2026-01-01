import { z } from 'zod';

/**
 * Chat model options schema
 */
export const chatModelOptionsSchema = z.object({
  maxTokens: z.number().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
  topP: z.number().min(0).max(1).optional(),
});

/**
 * Session configuration schema
 */
export const sessionConfigSchema = z.object({
  conversationId: z.string().optional(),
  model: z.string().min(1),
  system: z.string().optional(),
  agent: z.string().optional(),
  tools: z.array(z.string()).optional(),
  options: chatModelOptionsSchema.optional(),
});

/**
 * Chat reference schema
 */
export const chatReferenceSchema = z.object({
  type: z.enum(['file', 'selection', 'image']),
  uri: z.string(),
  content: z.string().optional(),
  range: z
    .object({
      start: z.number(),
      end: z.number(),
    })
    .optional(),
});

/**
 * Chat send request schema
 */
export const chatSendRequestSchema = z.object({
  prompt: z.string().min(1),
  references: z.array(chatReferenceSchema).optional(),
});

/**
 * Cancel request schema
 */
export const chatCancelRequestSchema = z.object({
  requestId: z.string().min(1),
});

export type SessionConfigSchema = z.infer<typeof sessionConfigSchema>;
export type ChatSendRequestSchema = z.infer<typeof chatSendRequestSchema>;
export type ChatReferenceSchema = z.infer<typeof chatReferenceSchema>;
export type ChatCancelRequestSchema = z.infer<typeof chatCancelRequestSchema>;
