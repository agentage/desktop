/**
 * Conversation persistence types
 */

import type { ChatMessage, SessionConfig } from './chat.types.js';

/**
 * Conversation reference in index (lightweight)
 */
export interface ConversationRef {
  /** Unique conversation ID */
  id: string;

  /** Relative path to conversation file (e.g., "2025-01-03/d4e5f6.json") */
  path: string;

  /** Conversation title (derived from first user message) */
  title: string;

  /** Optional agent ID if using an agent */
  agentId?: string;

  /** Model used for this conversation */
  model: string;

  /** Number of messages in conversation */
  messageCount: number;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;

  /** Tags for categorization/search */
  tags?: string[];

  /** Pinned conversations appear first in list */
  isPinned?: boolean;
}

/**
 * Index file structure
 */
export interface ConversationIndex {
  /** Schema version for migrations */
  version: number;

  /** Array of conversation references */
  conversations: ConversationRef[];

  /** Last index update timestamp */
  updatedAt?: string;
}

/**
 * Full conversation snapshot stored in date folder
 */
export interface ConversationSnapshot {
  /** Unique conversation ID */
  id: string;

  /** Conversation title */
  title: string;

  /** Optional agent ID */
  agentId?: string;

  /** System prompt used */
  systemPrompt: string;

  /** Model identifier */
  model: string;

  /** Full message history */
  messages: ChatMessage[];

  /** Creation timestamp */
  createdAt: string;

  /** Last update timestamp */
  updatedAt: string;

  /** Session config at time of last message */
  config?: SessionConfig;

  /** Tags for categorization */
  tags?: string[];

  /** Pinned status */
  isPinned?: boolean;

  /** Token usage statistics */
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

/**
 * Options for creating a new conversation
 */
export interface CreateConversationOptions {
  /** Optional conversation ID (if not provided, will be auto-generated) */
  id?: string;

  /** Optional agent ID */
  agentId?: string;

  /** System prompt */
  systemPrompt: string;

  /** Model identifier */
  model: string;

  /** Optional title (defaults to "New conversation") */
  title?: string;

  /** Optional tags */
  tags?: string[];

  /** Optional initial session config */
  config?: SessionConfig;
}

/**
 * Options for listing conversations
 */
export interface ListConversationsOptions {
  /** Filter by agent ID */
  agentId?: string;

  /** Filter by model */
  model?: string;

  /** Filter by tags */
  tags?: string[];

  /** Search in titles */
  search?: string;

  /** Include pinned first */
  pinnedFirst?: boolean;

  /** Sort order */
  sortBy?: 'createdAt' | 'updatedAt' | 'messageCount';

  /** Sort direction */
  sortDirection?: 'asc' | 'desc';

  /** Pagination: skip N items */
  skip?: number;

  /** Pagination: limit results */
  limit?: number;
}

/**
 * Conversation metadata update
 */
export interface UpdateConversationMetadata {
  title?: string;
  tags?: string[];
  isPinned?: boolean;
}
