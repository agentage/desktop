import Anthropic from '@anthropic-ai/sdk';
import { chatSendRequestSchema } from '../../shared/schemas/chat.schema.js';
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
  ToolCall,
  ToolResult,
} from '../../shared/types/chat.types.js';
import { toAnthropicTools } from '../tools/converter.js';
import { executeTool, listTools } from '../tools/index.js';
import type { ToolContext } from '../tools/types.js';
import { loadProviders, resolveProviderToken } from './model.providers.service.js';
import { getActiveWorkspace } from './workspace.service.js';
import {
  appendMessage,
  createConversation,
  getConversation,
  updateUsageStats,
} from './conversation.store.service.js';
import { logChatEvent, logError } from './logger.service.js';

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
 * Maximum tool execution iterations to prevent infinite loops
 */
const MAX_TOOL_ITERATIONS = 10;

/**
 * Maximum characters for tool result content to prevent context exhaustion
 */
const MAX_TOOL_RESULT_CHARS = 30000;

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
 * Truncate tool result content to prevent context window exhaustion
 */
const truncateToolResult = (content: string): string => {
  if (content.length <= MAX_TOOL_RESULT_CHARS) return content;
  return content.slice(0, MAX_TOOL_RESULT_CHARS) + '\n\n[Output truncated...]';
};

/**
 * Get Anthropic client with current token
 * Supports both API keys (sk-ant-api*) and OAuth tokens (sk-ant-oat*)
 * OAuth tokens require special headers and system prompt
 * Returns client and isOAuth flag
 */
const getAnthropicClient = async (): Promise<{ client: Anthropic; isOAuth: boolean }> => {
  const token = await resolveProviderToken('anthropic');

  if (!token) {
    throw new Error('Anthropic API key not configured');
  }

  // Detect OAuth token (sk-ant-oat*)
  const isOAuth = token.startsWith('sk-ant-oat');

  if (isOAuth) {
    // OAuth tokens use authToken and require beta headers
    return {
      client: new Anthropic({
        authToken: token,
        defaultHeaders: {
          'anthropic-beta': ANTHROPIC_BETA,
        },
      }),
      isOAuth: true,
    };
  }

  // API keys use apiKey
  return { client: new Anthropic({ apiKey: token }), isOAuth: false };
};

/**
 * Get or create conversation
 */
const getOrCreateConversation = async (
  sessionConfig: SessionConfig,
  conversationId?: string
): Promise<Conversation> => {
  // Try to load existing conversation from store
  if (conversationId) {
    const stored = await getConversation(conversationId);
    if (stored) {
      // Convert snapshot to in-memory conversation format
      return {
        id: stored.id,
        config: sessionConfig,
        messages: stored.messages,
        createdAt: stored.createdAt,
        updatedAt: stored.updatedAt,
      };
    }
  }

  // Check in-memory cache
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

  // Create persistent conversation in store with the same ID
  await createConversation({
    id, // Pass the same ID
    agentId: sessionConfig.agent,
    systemPrompt: sessionConfig.system ?? '',
    model: sessionConfig.model,
    title: 'New conversation',
    config: sessionConfig,
  }).catch((err: unknown) => {
    const errorDetails = err instanceof Error ? { message: err.message, stack: err.stack } : err;
    void logError('Failed to create conversation in store', errorDetails);
  });

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
 * Build system prompt - OAuth tokens require Claude Code prompt FIRST
 */
const buildSystemPrompt = (
  config: SessionConfig,
  isOAuth: boolean
): string | Anthropic.TextBlockParam[] | undefined => {
  if (isOAuth) {
    // OAuth: Required system prompt must be first
    if (config.system) {
      return [
        { type: 'text', text: CLAUDE_CODE_SYSTEM_PROMPT },
        { type: 'text', text: config.system },
      ];
    }
    return CLAUDE_CODE_SYSTEM_PROMPT;
  }
  // API key: Use custom system prompt as-is
  return config.system;
};

/**
 * Build Anthropic tools array from enabled tool IDs
 */
const buildToolsForRequest = (enabledToolIds?: string[]): Anthropic.Tool[] => {
  const allTools = listTools();

  // If no tools specified, don't include any
  if (!enabledToolIds || enabledToolIds.length === 0) {
    return [];
  }

  const enabledTools = allTools.filter((t) => enabledToolIds.includes(t.name));
  return toAnthropicTools(enabledTools);
};

/**
 * Extract tool use blocks from Claude response
 */
const extractToolUseBlocks = (content: Anthropic.ContentBlock[]): Anthropic.ToolUseBlock[] =>
  content.filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use');

/**
 * Tool result block for API
 */
interface ToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

/**
 * Execute a single tool and return result block
 */
const executeToolCall = async (
  toolUse: Anthropic.ToolUseBlock,
  context: ToolContext,
  emitEvent: (event: ChatEvent) => void,
  requestId: string
): Promise<ToolResultBlock> => {
  // Emit tool_call event for UI
  emitEvent({
    requestId,
    type: 'tool_call',
    toolCallId: toolUse.id,
    name: toolUse.name,
    input: toolUse.input,
  });

  try {
    const result = await executeTool(
      toolUse.name,
      toolUse.input as Record<string, unknown>,
      context
    );

    const rawContent = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    const content = truncateToolResult(rawContent);

    // Emit tool_result event for UI
    emitEvent({
      requestId,
      type: 'tool_result',
      toolCallId: toolUse.id,
      name: toolUse.name,
      result,
      isError: false,
    });

    return {
      type: 'tool_result',
      tool_use_id: toolUse.id,
      content,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Emit error result for UI
    emitEvent({
      requestId,
      type: 'tool_result',
      toolCallId: toolUse.id,
      name: toolUse.name,
      result: errorMessage,
      isError: true,
    });

    return {
      type: 'tool_result',
      tool_use_id: toolUse.id,
      content: errorMessage,
      is_error: true,
    };
  }
};

/**
 * Send a chat message and stream response
 */
export const sendMessage = (
  request: ChatSendRequest,
  emitEvent: (event: ChatEvent) => void
): ChatSendResponse => {
  const validated = chatSendRequestSchema.parse(request);
  const config = validated.config;

  const requestId = generateId('req');
  
  // Make conversation loading async
  void (async (): Promise<void> => {
    const conversation = await getOrCreateConversation(config, config.conversationId);
    const abortController = new AbortController();

    activeRequests.set(requestId, abortController);

    // Log chat event
    await logChatEvent(conversation.id, requestId, 'MESSAGE_START', {
      prompt: validated.prompt,
      model: config.model,
      hasReferences: Boolean(validated.references?.length),
    });

    // Add user message to history
    const userMessage: ChatMessage = {
      role: 'user',
      content: validated.prompt,
      references: validated.references,
      timestamp: new Date().toISOString(),
      config, // Store config with user message for restoration
    };
    conversation.messages.push(userMessage);
    conversation.updatedAt = userMessage.timestamp;

    // Persist user message to store
    await appendMessage(conversation.id, userMessage).catch((err: unknown) => {
      const errorDetails = err instanceof Error ? { message: err.message, stack: err.stack } : err;
      void logError('Failed to append user message to store', errorDetails);
    });

    // Start streaming in background
    void streamResponse(
      requestId,
      conversation,
      validated,
      emitEvent,
      abortController.signal,
      config
    );
  })();

  // Return immediately with requestId (conversationId will be available after async operation)
  return { requestId, conversationId: config.conversationId ?? '' };
};

/**
 * Stream response from Anthropic with tool execution loop
 * Continues until stop_reason is not 'tool_use' or max iterations reached
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
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  try {
    const { client, isOAuth } = await getAnthropicClient();
    let messages = buildMessages(conversation, request);
    const tools = buildToolsForRequest(config.tools);
    const systemPrompt = buildSystemPrompt(config, isOAuth);

    // Tool context for execution
    const workspace = await getActiveWorkspace();
    const toolContext: ToolContext = {
      workspacePath: workspace?.path,
      abortSignal: signal,
    };

    let continueLoop = true;
    let iterations = 0;

    while (continueLoop && !signal.aborted && iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      const stream = client.messages.stream(
        {
          model: config.model,
          max_tokens: config.options?.maxTokens ?? 4096,
          temperature: config.options?.temperature,
          top_p: config.options?.topP,
          system: systemPrompt,
          messages,
          tools: tools.length > 0 ? tools : undefined,
        },
        { signal }
      );

      // Stream text chunks
      for await (const event of stream) {
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

      const finalMessage = await stream.finalMessage();
      const stopReason = finalMessage.stop_reason;

      // Accumulate token usage
      totalInputTokens += finalMessage.usage.input_tokens;
      totalOutputTokens += finalMessage.usage.output_tokens;

      // Check if we need to execute tools
      if (stopReason === 'tool_use') {
        const toolUseBlocks = extractToolUseBlocks(finalMessage.content);

        // Store assistant message with tool calls
        const assistantToolCalls: ChatMessage = {
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date().toISOString(),
          toolCalls: toolUseBlocks.map((block) => ({
            id: block.id,
            name: block.name,
            input: block.input,
          })),
        };
        conversation.messages.push(assistantToolCalls);
        
        // Persist assistant message with tool calls
        await appendMessage(conversation.id, assistantToolCalls).catch((err: unknown) => {
          const errorDetails =
            err instanceof Error ? { message: err.message, stack: err.stack } : err;
          void logError('Failed to append assistant tool calls to store', errorDetails);
        });

        // Execute all tool calls sequentially
        const toolResults: ToolResultBlock[] = [];
        const toolResultsData: { id: string; name: string; result: unknown; isError?: boolean }[] =
          [];

        for (const toolUse of toolUseBlocks) {
          const result = await executeToolCall(toolUse, toolContext, emitEvent, requestId);
          toolResults.push(result);
          toolResultsData.push({
            id: toolUse.id,
            name: toolUse.name,
            result: result.content,
            isError: result.is_error,
          });
        }

        // Store tool results as a user message
        const toolResultsMessage: ChatMessage = {
          role: 'user',
          content: '', // No user content, just tool results
          timestamp: new Date().toISOString(),
          toolResults: toolResultsData,
        };
        conversation.messages.push(toolResultsMessage);
        
        // Persist tool results
        await appendMessage(conversation.id, toolResultsMessage).catch((err: unknown) => {
          const errorDetails =
            err instanceof Error ? { message: err.message, stack: err.stack } : err;
          void logError('Failed to append tool results to store', errorDetails);
        });

        // Add assistant message + tool results to conversation for next iteration
        messages = [
          ...messages,
          { role: 'assistant' as const, content: finalMessage.content },
          { role: 'user' as const, content: toolResults },
        ];

        // Continue the loop for more response
        continueLoop = true;
      } else {
        // No more tool calls, we're done
        continueLoop = false;

        // Emit total usage
        emitEvent({
          requestId,
          type: 'usage',
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
        });

        // Add final assistant message to conversation history
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date().toISOString(),
        };
        conversation.messages.push(assistantMessage);
        conversation.updatedAt = assistantMessage.timestamp;

        // Persist assistant message and usage to store
        await appendMessage(conversation.id, assistantMessage).catch((err: unknown) => {
          const errorDetails =
            err instanceof Error ? { message: err.message, stack: err.stack } : err;
          void logError('Failed to append assistant message to store', errorDetails);
        });

        await updateUsageStats(conversation.id, totalInputTokens, totalOutputTokens).catch(
          (err: unknown) => {
            const errorDetails =
              err instanceof Error ? { message: err.message, stack: err.stack } : err;
            void logError('Failed to update usage stats', errorDetails);
          }
        );

        // Log completion
        await logChatEvent(conversation.id, requestId, 'MESSAGE_COMPLETE', {
          messageCount: conversation.messages.length,
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          stopReason: stopReason ?? 'end_turn',
        });

        // Emit done
        emitEvent({
          requestId,
          type: 'done',
          stopReason: stopReason ?? 'end_turn',
        });
      }
    }

    // Check if we hit max iterations
    if (iterations >= MAX_TOOL_ITERATIONS && continueLoop) {
      await logChatEvent(
        conversation.id,
        requestId,
        'ERROR',
        `Tool loop exceeded max iterations (${String(MAX_TOOL_ITERATIONS)})`
      );
      emitEvent({
        requestId,
        type: 'error',
        code: 'TOOL_ERROR',
        message: `Tool execution loop exceeded maximum iterations (${String(MAX_TOOL_ITERATIONS)})`,
        recoverable: false,
      });
    }
  } catch (error) {
    const err = error as Error & { status?: number; error?: { type?: string } };

    // Log error
    await logChatEvent(conversation.id, requestId, 'ERROR', {
      message: err.message,
      status: err.status,
      type: err.error?.type,
    });

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
  conversations.clear();
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
