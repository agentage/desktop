import Anthropic from '@anthropic-ai/sdk';
import { chatSendRequestSchema, sessionConfigSchema } from '../../shared/schemas/chat.schema.js';
import type {
  ChatAgentInfo,
  ChatEvent,
  ChatMessage,
  ChatModelInfo,
  ChatSendRequest,
  ChatSendResponse,
  ChatToolInfo,
  Conversation,
  SessionConfig,
} from '../../shared/types/chat.types.js';
import { loadProviders, resolveProviderToken } from './model.providers.service.js';

/**
 * Required system prompt for OAuth tokens (Claude Pro/Max)
 * CRITICAL: Must be the FIRST element in system prompt array
 */
const CLAUDE_CODE_SYSTEM_PROMPT = "You are Claude Code, Anthropic's official CLI for Claude.";

/**
 * Required beta header for OAuth tokens
 */
const ANTHROPIC_BETA = 'oauth-2025-04-20,claude-code-20250219,interleaved-thinking-2025-05-14';

/**
 * Active session configuration
 */
let currentConfig: SessionConfig | null = null;

/**
 * Track if current token is OAuth (for system prompt requirements)
 */
let isOAuthToken = false;

/**
 * In-memory conversation storage
 */
const conversations = new Map<string, Conversation>();

/**
 * Active requests for cancellation
 */
const activeRequests = new Map<string, AbortController>();

/**
 * Generate unique ID
 */
const generateId = (prefix: string): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

/**
 * Get Anthropic client with current token
 * Supports both API keys (sk-ant-api*) and OAuth tokens (sk-ant-oat*)
 * OAuth tokens require special headers and system prompt
 */
const getAnthropicClient = async (): Promise<Anthropic> => {
  const token = await resolveProviderToken('anthropic');

  if (!token) {
    throw new Error('Anthropic API key not configured');
  }

  // Detect OAuth token (sk-ant-oat*)
  isOAuthToken = token.startsWith('sk-ant-oat');

  if (isOAuthToken) {
    // OAuth tokens use authToken and require beta headers
    return new Anthropic({
      authToken: token,
      defaultHeaders: {
        'anthropic-beta': ANTHROPIC_BETA,
      },
    });
  }

  // API keys use apiKey
  return new Anthropic({ apiKey: token });
};

/**
 * Configure the active session
 */
export const configureSession = (config: SessionConfig): void => {
  const validated = sessionConfigSchema.parse(config);
  currentConfig = validated;
};

/**
 * Get or create conversation
 */
const getOrCreateConversation = (
  sessionConfig: SessionConfig,
  conversationId?: string
): Conversation => {
  if (conversationId && conversations.has(conversationId)) {
    const existing = conversations.get(conversationId);
    if (existing) return existing;
  }

  const id = conversationId ?? generateId('conv');
  const now = new Date().toISOString();

  const conversation: Conversation = {
    id,
    config: sessionConfig,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  conversations.set(id, conversation);
  return conversation;
};

/**
 * Build messages array for Anthropic API
 */
const buildMessages = (
  conversation: Conversation,
  newMessage: ChatSendRequest
): Anthropic.MessageParam[] => {
  const messages: Anthropic.MessageParam[] = [];

  // Add history
  for (const msg of conversation.messages) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  // Add new user message with references
  let content = newMessage.prompt;

  if (newMessage.references?.length) {
    const refTexts = newMessage.references
      .filter((ref) => ref.content)
      .map((ref) => `[${ref.type}: ${ref.uri}]\n${String(ref.content)}`)
      .join('\n\n');

    if (refTexts) {
      content = `${refTexts}\n\n${newMessage.prompt}`;
    }
  }

  messages.push({ role: 'user', content });

  return messages;
};

/**
 * Send a chat message and stream response
 */
export const sendMessage = (
  request: ChatSendRequest,
  emitEvent: (event: ChatEvent) => void
): ChatSendResponse => {
  const validated = chatSendRequestSchema.parse(request);

  if (!currentConfig) {
    throw new Error('Session not configured. Call configure() first.');
  }

  const requestId = generateId('req');
  const conversation = getOrCreateConversation(currentConfig, currentConfig.conversationId);
  const abortController = new AbortController();

  activeRequests.set(requestId, abortController);

  // Add user message to history
  const userMessage: ChatMessage = {
    role: 'user',
    content: validated.prompt,
    references: validated.references,
    timestamp: new Date().toISOString(),
  };
  conversation.messages.push(userMessage);
  conversation.updatedAt = userMessage.timestamp;

  // Start streaming in background
  void streamResponse(
    requestId,
    conversation,
    validated,
    emitEvent,
    abortController.signal,
    currentConfig
  );

  return { requestId, conversationId: conversation.id };
};

/**
 * Stream response from Anthropic
 */
const streamResponse = async (
  requestId: string,
  conversation: Conversation,
  request: ChatSendRequest,
  emitEvent: (event: ChatEvent) => void,
  signal: AbortSignal,
  config: SessionConfig
): Promise<void> => {
  let fullResponse = '';

  try {
    const client = await getAnthropicClient();
    const messages = buildMessages(conversation, request);

    // Build system prompt - OAuth tokens require Claude Code prompt FIRST
    let systemPrompt: string | Anthropic.TextBlockParam[] | undefined;

    if (isOAuthToken) {
      // OAuth: Required system prompt must be first
      if (config.system) {
        systemPrompt = [
          { type: 'text', text: CLAUDE_CODE_SYSTEM_PROMPT },
          { type: 'text', text: config.system },
        ];
      } else {
        systemPrompt = CLAUDE_CODE_SYSTEM_PROMPT;
      }
    } else {
      // API key: Use custom system prompt as-is
      systemPrompt = config.system;
    }

    const stream = client.messages.stream(
      {
        model: config.model,
        max_tokens: config.options?.maxTokens ?? 4096,
        temperature: config.options?.temperature,
        top_p: config.options?.topP,
        system: systemPrompt,
        messages,
      },
      { signal }
    );

    for await (const event of stream) {
      if (signal.aborted) {
        emitEvent({
          requestId,
          type: 'error',
          code: 'CANCELLED',
          message: 'Request cancelled',
          recoverable: false,
        });
        return;
      }

      if (event.type === 'content_block_delta') {
        const delta = event.delta;
        if ('text' in delta) {
          fullResponse += delta.text;
          emitEvent({ requestId, type: 'text', text: delta.text });
        } else if ('thinking' in delta) {
          emitEvent({ requestId, type: 'thinking', text: delta.thinking });
        }
      }
    }

    // Get final message for usage stats
    const finalMessage = await stream.finalMessage();

    // Emit usage
    emitEvent({
      requestId,
      type: 'usage',
      inputTokens: finalMessage.usage.input_tokens,
      outputTokens: finalMessage.usage.output_tokens,
    });

    // Add assistant message to history
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date().toISOString(),
    };
    conversation.messages.push(assistantMessage);
    conversation.updatedAt = assistantMessage.timestamp;

    // Emit done
    emitEvent({
      requestId,
      type: 'done',
      stopReason: finalMessage.stop_reason ?? 'end_turn',
    });
  } catch (error) {
    const err = error as Error & { status?: number; error?: { type?: string } };

    if (signal.aborted || err.name === 'AbortError') {
      emitEvent({
        requestId,
        type: 'error',
        code: 'CANCELLED',
        message: 'Request cancelled',
        recoverable: false,
      });
      return;
    }

    // Map Anthropic errors to our error codes
    const message = err.message || 'Unknown error';

    if (err.status === 401) {
      emitEvent({
        requestId,
        type: 'error',
        code: 'AUTH_ERROR',
        message: 'Invalid or expired API key. Please re-authorize Anthropic in Settings → Models.',
        recoverable: false,
      });
    } else if (err.status === 400 && message.includes('Claude Code')) {
      // OAuth token without required system prompt
      emitEvent({
        requestId,
        type: 'error',
        code: 'AUTH_ERROR',
        message: 'OAuth token requires Claude Code system prompt. Please report this bug.',
        recoverable: false,
      });
    } else if (err.status === 429) {
      emitEvent({
        requestId,
        type: 'error',
        code: 'RATE_LIMIT',
        message: 'Rate limit exceeded',
        recoverable: true,
      });
    } else if (err.error?.type === 'invalid_request_error' && message.includes('context')) {
      emitEvent({
        requestId,
        type: 'error',
        code: 'CONTEXT_LENGTH',
        message,
        recoverable: false,
      });
    } else if (err.name === 'TypeError' || message.includes('fetch')) {
      emitEvent({
        requestId,
        type: 'error',
        code: 'NETWORK_ERROR',
        message: 'Network error',
        recoverable: true,
      });
    } else {
      emitEvent({
        requestId,
        type: 'error',
        code: 'INTERNAL_ERROR',
        message,
        recoverable: false,
      });
    }
  } finally {
    activeRequests.delete(requestId);
  }
};

/**
 * Cancel an in-flight request
 */
export const cancelRequest = (requestId: string): void => {
  const controller = activeRequests.get(requestId);
  if (controller) {
    controller.abort();
    activeRequests.delete(requestId);
  }
};

/**
 * Clear conversation history
 */
export const clearHistory = (): void => {
  if (currentConfig?.conversationId) {
    conversations.delete(currentConfig.conversationId);
  }
  currentConfig = null;
};

/**
 * Get available models from configured providers
 */
export const getModels = async (): Promise<ChatModelInfo[]> => {
  const result = await loadProviders();
  const models: ChatModelInfo[] = [];

  for (const provider of result.providers) {
    if (!provider.enabled) continue;

    for (const model of provider.models) {
      if (!model.enabled) continue;

      models.push({
        id: model.id,
        name: model.displayName,
        provider: provider.provider,
        contextWindow: getContextWindow(model.id),
      });
    }
  }

  return models;
};

/**
 * Get context window for a model
 */
const getContextWindow = (modelId: string): number => {
  // Claude models context windows
  if (modelId.includes('claude-3-opus')) return 200000;
  if (modelId.includes('claude-3-5') || modelId.includes('claude-3-7')) return 200000;
  if (modelId.includes('claude-sonnet-4') || modelId.includes('claude-opus-4')) return 200000;
  if (modelId.includes('claude-3-haiku')) return 200000;
  // OpenAI models
  if (modelId.includes('gpt-4o')) return 128000;
  if (modelId.includes('gpt-4-turbo')) return 128000;
  if (modelId.includes('gpt-4')) return 8192;
  if (modelId.includes('gpt-3.5')) return 16385;
  // Default
  return 100000;
};

/**
 * Get available tools (Phase 2 - returns empty for now)
 */
export const getTools = (): Promise<ChatToolInfo[]> => Promise.resolve([]);

/**
 * Get available agents (Phase 2 - returns empty for now)
 */
export const getAgents = (): Promise<ChatAgentInfo[]> => Promise.resolve([]);
