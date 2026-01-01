/**
 * Chat types for Claude chat functionality
 */

import type { ModelProviderType } from './model.providers.types.js';

/**
 * Chat model parameters
 */
export interface ChatModelOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

/**
 * Session configuration for chat
 */
export interface SessionConfig {
  /** Existing conversation ID to resume, omit for new */
  conversationId?: string;

  /** Model identifier (e.g., 'claude-sonnet-4-20250514') */
  model: string;

  /** System prompt (ignored if agent specified) */
  system?: string;

  /** Agent ID (predefined system prompt + config) */
  agent?: string;

  /** Tool IDs to enable for this session */
  tools?: string[];

  /** Model parameters */
  options?: ChatModelOptions;
}

/**
 * Model information for chat
 */
export interface ChatModelInfo {
  id: string;
  name: string;
  provider: ModelProviderType;
  contextWindow: number;
  capabilities?: string[];
}

/**
 * Tool information for chat
 */
export interface ChatToolInfo {
  id: string;
  name: string;
  description: string;
  // inputSchema managed by backend, not exposed to renderer
}

/**
 * Agent information for chat
 */
export interface ChatAgentInfo {
  id: string;
  name: string;
  description: string;
  defaultModel?: string;
  defaultTools?: string[];
}

/**
 * Reference attached to chat message
 */
export interface ChatReference {
  type: 'file' | 'selection' | 'image';
  uri: string;
  content?: string;
  range?: { start: number; end: number };
}

/**
 * Request to send a chat message
 */
export interface ChatSendRequest {
  /** User message */
  prompt: string;

  /** Attached context (files, selections, images) */
  references?: ChatReference[];
}

/**
 * Response from sending a chat message
 */
export interface ChatSendResponse {
  requestId: string;
  conversationId: string;
}

/**
 * Error codes for chat operations
 */
export type ChatErrorCode =
  | 'AUTH_ERROR'
  | 'RATE_LIMIT'
  | 'MODEL_UNAVAILABLE'
  | 'CONTEXT_LENGTH'
  | 'CANCELLED'
  | 'NETWORK_ERROR'
  | 'TOOL_ERROR'
  | 'INTERNAL_ERROR';

/**
 * Stop reasons for chat completion
 */
export type ChatStopReason =
  | 'end_turn'
  | 'tool_use'
  | 'max_tokens'
  | 'stop_sequence'
  | 'pause_turn'
  | 'refusal';

/**
 * Stream event types
 */
export type ChatStreamEvent =
  | { type: 'text'; text: string }
  | { type: 'thinking'; text: string }
  | { type: 'tool_call'; toolCallId: string; name: string; input: unknown }
  | { type: 'tool_result'; toolCallId: string; name: string; result: unknown; isError?: boolean }
  | { type: 'usage'; inputTokens: number; outputTokens: number }
  | { type: 'done'; stopReason: ChatStopReason }
  | {
      type: 'error';
      code: ChatErrorCode;
      message: string;
      recoverable: boolean;
      retryAfter?: number;
    };

/**
 * Chat event with request ID for correlation
 */
export type ChatEvent = { requestId: string } & ChatStreamEvent;

/**
 * Message role in conversation
 */
export type ChatMessageRole = 'user' | 'assistant';

/**
 * Message in conversation history
 */
export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
  references?: ChatReference[];
  timestamp: string;
}

/**
 * Conversation state managed by backend
 */
export interface Conversation {
  id: string;
  config: SessionConfig;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Chat API exposed via preload
 */
export interface ChatAPI {
  /** Configure active session */
  configure: (config: SessionConfig) => void;

  /** Send message, returns request and conversation IDs */
  send: (request: ChatSendRequest) => Promise<ChatSendResponse>;

  /** Cancel in-flight request */
  cancel: (requestId: string) => void;

  /** Subscribe to chat events */
  onEvent: (callback: (event: ChatEvent) => void) => () => void;

  /** List available models */
  getModels: () => Promise<ChatModelInfo[]>;

  /** List available tools */
  getTools: () => Promise<ChatToolInfo[]>;

  /** List available agents */
  getAgents: () => Promise<ChatAgentInfo[]>;

  /** Clear current conversation history */
  clear: () => void;
}
