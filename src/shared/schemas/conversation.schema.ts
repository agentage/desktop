import { z } from 'zod';
import { sessionConfigSchema } from './chat.schema.js';

/**
 * ISO datetime string validator
 */
const isoDatetime = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid ISO datetime string',
});

/**
 * Tool call schema
 */
const toolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  input: z.unknown(),
});

/**
 * Tool result schema
 */
const toolResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  result: z.unknown(),
  isError: z.boolean().optional(),
});

/**
 * Chat message schema
 */
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  references: z
    .array(
      z.object({
        type: z.enum(['file', 'selection', 'image']),
        uri: z.string(),
        content: z.string().optional(),
        range: z
          .object({
            start: z.number(),
            end: z.number(),
          })
          .optional(),
      })
    )
    .optional(),
  timestamp: isoDatetime,
  config: sessionConfigSchema.optional(),
  toolCalls: z.array(toolCallSchema).optional(),
  toolResults: z.array(toolResultSchema).optional(),
});

/**
 * Conversation reference schema
 */
export const conversationRefSchema = z.object({
  id: z.string(),
  path: z.string(),
  title: z.string(),
  agentId: z.string().optional(),
  model: z.string(),
  messageCount: z.number().nonnegative(),
  createdAt: isoDatetime,
  updatedAt: isoDatetime,
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
});

/**
 * Index schema
 */
export const conversationIndexSchema = z.object({
  version: z.literal(1),
  conversations: z.array(conversationRefSchema),
  updatedAt: isoDatetime.optional(),
});

/**
 * Usage statistics schema
 */
const usageStatsSchema = z.object({
  inputTokens: z.number().nonnegative(),
  outputTokens: z.number().nonnegative(),
  totalTokens: z.number().nonnegative(),
});

/**
 * Conversation snapshot schema
 */
export const conversationSnapshotSchema = z.object({
  id: z.string(),
  title: z.string(),
  agentId: z.string().optional(),
  systemPrompt: z.string(),
  model: z.string(),
  messages: z.array(chatMessageSchema),
  createdAt: isoDatetime,
  updatedAt: isoDatetime,
  config: sessionConfigSchema.optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
  usage: usageStatsSchema.optional(),
});

/**
 * Create options schema
 */
export const createConversationOptionsSchema = z.object({
  id: z.string().optional(),
  agentId: z.string().optional(),
  systemPrompt: z.string(),
  model: z.string(),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  config: sessionConfigSchema.optional(),
});

/**
 * List options schema
 */
export const listConversationsOptionsSchema = z.object({
  agentId: z.string().optional(),
  model: z.string().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  pinnedFirst: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'messageCount']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  skip: z.number().nonnegative().optional(),
  limit: z.number().positive().optional(),
});

/**
 * Update metadata schema
 */
export const updateConversationMetadataSchema = z.object({
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
});

// Export types
export type ConversationRef = z.infer<typeof conversationRefSchema>;
export type ConversationIndex = z.infer<typeof conversationIndexSchema>;
export type ConversationSnapshot = z.infer<typeof conversationSnapshotSchema>;
export type CreateConversationOptions = z.infer<typeof createConversationOptionsSchema>;
export type ListConversationsOptions = z.infer<typeof listConversationsOptionsSchema>;
export type UpdateConversationMetadata = z.infer<typeof updateConversationMetadataSchema>;
