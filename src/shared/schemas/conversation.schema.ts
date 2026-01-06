import { z } from 'zod';

/**
 * ISO datetime string validator
 */
const isoDatetime = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid ISO datetime string',
});

/**
 * Provider type for conversations
 */
const providerSchema = z.enum(['openai', 'anthropic', 'custom']);

/**
 * Attachment schema (Agentage extension of OpenAI format)
 */
const attachmentSchema = z.object({
  type: z.enum(['file', 'image', 'selection']),
  uri: z.string(),
  name: z.string().optional(),
  content: z.string().optional(),
  range: z
    .object({
      start: z.number(),
      end: z.number(),
    })
    .optional(),
  mimeType: z.string().optional(),
});

/**
 * Tool call schema (OpenAI-compatible format)
 */
const toolCallSchema = z.object({
  id: z.string(),
  type: z.literal('function'),
  function: z.object({
    name: z.string(),
    arguments: z.string(), // JSON-encoded
  }),
  status: z.enum(['pending', 'running', 'completed', 'error']).optional(),
});

/**
 * User message schema (OpenAI-compatible)
 */
const userMessageSchema = z.object({
  role: z.literal('user'),
  id: z.string(),
  content: z.string(),
  timestamp: isoDatetime,
  name: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
  config: z
    .object({
      model: z.string().optional(),
      temperature: z.number().optional(),
      maxTokens: z.number().optional(),
    })
    .optional(),
});

/**
 * Assistant message schema (OpenAI-compatible)
 */
const assistantMessageSchema = z.object({
  role: z.literal('assistant'),
  id: z.string(),
  content: z.string().nullable(),
  timestamp: isoDatetime,
  tool_calls: z.array(toolCallSchema).optional(),
  refusal: z.string().nullable().optional(),
  _anthropic: z
    .object({
      thinking: z.string().optional(),
      stopReason: z.enum(['end_turn', 'max_tokens', 'stop_sequence', 'tool_use']).optional(),
    })
    .optional(),
  _openai: z
    .object({
      finishReason: z.enum(['stop', 'length', 'tool_calls', 'content_filter']).optional(),
    })
    .optional(),
});

/**
 * Tool message schema (OpenAI-compatible)
 */
const toolMessageSchema = z.object({
  role: z.literal('tool'),
  id: z.string(),
  content: z.string(),
  timestamp: isoDatetime,
  tool_call_id: z.string(),
  name: z.string().optional(),
  isError: z.boolean().optional(),
  duration: z.number().optional(),
});

/**
 * Conversation message union schema (OpenAI-compatible, discriminated by 'role')
 */
export const conversationMessageSchema = z.discriminatedUnion('role', [
  userMessageSchema,
  assistantMessageSchema,
  toolMessageSchema,
]);

/**
 * Chat model options schema
 */
const chatModelOptionsSchema = z.object({
  maxTokens: z.number().optional(),
  temperature: z.number().optional(),
  topP: z.number().optional(),
});

/**
 * Session configuration schema
 */
const sessionConfigSchema = z.object({
  model: z.string(),
  provider: providerSchema,
  system: z.string().optional(),
  agentId: z.string().optional(),
  agentName: z.string().optional(),
  tools: z.array(z.string()).optional(),
  modelConfig: chatModelOptionsSchema.optional(),
});

/**
 * Conversation metadata schema
 */
const conversationMetadataSchema = z.object({
  createdAt: isoDatetime,
  updatedAt: isoDatetime,
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
  workspace: z.string().optional(),
  exportedFrom: z
    .object({
      app: z.string(),
      version: z.string(),
      timestamp: isoDatetime,
    })
    .optional(),
});

/**
 * Usage statistics schema
 */
const usageStatsSchema = z.object({
  inputTokens: z.number().nonnegative(),
  outputTokens: z.number().nonnegative(),
  totalTokens: z.number().nonnegative(),
  byModel: z
    .record(
      z.string(),
      z.object({
        inputTokens: z.number().nonnegative(),
        outputTokens: z.number().nonnegative(),
      })
    )
    .optional(),
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
 * Conversation snapshot schema (v1.0.0)
 */
export const conversationSnapshotSchema = z.object({
  version: z.literal('1.0.0'),
  format: z.literal('agentage-conversation'),
  id: z.string(),
  title: z.string(),
  session: sessionConfigSchema,
  messages: z.array(conversationMessageSchema),
  metadata: conversationMetadataSchema,
  usage: usageStatsSchema.optional(),
});

/**
 * Create options schema
 */
export const createConversationOptionsSchema = z.object({
  id: z.string().optional(),
  agentId: z.string().optional(),
  agentName: z.string().optional(),
  system: z.string(),
  model: z.string(),
  provider: providerSchema,
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  modelConfig: chatModelOptionsSchema.optional(),
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

// Export schema types (for internal validation only)
// Application code should use types from conversation.types.ts
export type ConversationMessageSchema = z.infer<typeof conversationMessageSchema>;
export type UserMessageSchema = z.infer<typeof userMessageSchema>;
export type AssistantMessageSchema = z.infer<typeof assistantMessageSchema>;
export type ToolMessageSchema = z.infer<typeof toolMessageSchema>;
export type AttachmentSchema = z.infer<typeof attachmentSchema>;
export type ToolCallSchema = z.infer<typeof toolCallSchema>;
export type SessionConfigSchema = z.infer<typeof sessionConfigSchema>;
export type ConversationMetadataSchema = z.infer<typeof conversationMetadataSchema>;
export type UsageStatsSchema = z.infer<typeof usageStatsSchema>;
export type ConversationRefSchema = z.infer<typeof conversationRefSchema>;
export type ConversationIndexSchema = z.infer<typeof conversationIndexSchema>;
export type ConversationSnapshotSchema = z.infer<typeof conversationSnapshotSchema>;
export type CreateConversationOptionsSchema = z.infer<typeof createConversationOptionsSchema>;
export type ListConversationsOptionsSchema = z.infer<typeof listConversationsOptionsSchema>;
export type UpdateConversationMetadataSchema = z.infer<typeof updateConversationMetadataSchema>;
