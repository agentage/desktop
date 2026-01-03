import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ChatAgentInfo,
  ChatEvent,
  ChatModelInfo,
  ChatSendResponse,
  ChatToolInfo,
} from '../../../../shared/types/chat.types.js';

/**
 * Tool call status
 */
export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'error';

/**
 * Tool result data for UI
 */
export interface ToolResultUI {
  content: string;
  isError: boolean;
  truncated?: boolean;
}

/**
 * Tool call data for UI
 */
export interface ToolCallUI {
  id: string;
  name: string;
  input: Record<string, unknown>;
  status: ToolCallStatus;
  result?: ToolResultUI;
}

/**
 * Content block - either text or a tool call (for interleaved display)
 */
export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_call'; toolCall: ToolCallUI };

/**
 * Message in the chat UI
 */
export interface ChatUIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  error?: string;
  usage?: { inputTokens: number; outputTokens: number };
  /** Tool calls made by assistant (deprecated, use contentBlocks) */
  toolCalls?: ToolCallUI[];
  /** Interleaved content blocks - text and tool calls in order */
  contentBlocks?: ContentBlock[];
}

/**
 * Chat state
 */
interface ChatState {
  messages: ChatUIMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  currentRequestId: string | null;
}

/**
 * Format tool result for display
 */
const formatToolResult = (result: unknown): string => {
  if (typeof result === 'string') {
    return result;
  }
  try {
    return JSON.stringify(result, null, 2);
  } catch {
    return String(result);
  }
};

/**
 * useChat hook return type
 */
interface UseChatReturn {
  /** Chat messages */
  messages: ChatUIMessage[];
  /** Whether a message is being streamed */
  isLoading: boolean;
  /** Current error if any */
  error: string | null;
  /** Current conversation ID */
  conversationId: string | null;
  /** Available models */
  models: ChatModelInfo[];
  /** Available tools */
  tools: ChatToolInfo[];
  /** Enabled tool IDs */
  enabledTools: string[];
  /** Available agents */
  agents: ChatAgentInfo[];
  /** Currently selected model */
  selectedModel: ChatModelInfo | null;
  /** Currently selected agent */
  selectedAgent: ChatAgentInfo | null;
  /** Send a message */
  sendMessage: (prompt: string) => Promise<void>;
  /** Cancel current request */
  cancel: () => void;
  /** Clear chat history */
  clear: () => void;
  /** Select a model */
  selectModel: (modelId: string) => void;
  /** Select an agent */
  selectAgent: (agentId: string) => void;
  /** Update enabled tools */
  setEnabledTools: (tools: string[]) => void;
}

const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';

/**
 * Hook for managing chat state and interactions
 */
export const useChat = (): UseChatReturn => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    conversationId: null,
    currentRequestId: null,
  });

  const [models, setModels] = useState<ChatModelInfo[]>([]);
  const [tools, setTools] = useState<ChatToolInfo[]>([]);
  const [enabledTools, setEnabledTools] = useState<string[]>([]);
  const [agents, setAgents] = useState<ChatAgentInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<ChatModelInfo | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<ChatAgentInfo | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const unsubscribeToolsRef = useRef<(() => void) | null>(null);
  const unsubscribeModelsRef = useRef<(() => void) | null>(null);

  // Load available models, tools, agents on mount
  useEffect(() => {
    const loadResources = async (): Promise<void> => {
      try {
        const [loadedModels, loadedTools, loadedAgents, toolsListResult] = await Promise.all([
          window.agentage.chat.getModels(),
          window.agentage.chat.getTools(),
          window.agentage.chat.getAgents(),
          window.agentage.tools.list(),
        ]);

        setModels(loadedModels);
        setTools(loadedTools);
        setAgents(loadedAgents);

        // Load enabled tools from tools settings
        const enabled = toolsListResult.settings.enabledTools;
        setEnabledTools(enabled);

        // Set default selected model
        if (loadedModels.length > 0) {
          const defaultModel = loadedModels.find((m) => m.id.includes('sonnet')) ?? loadedModels[0];
          setSelectedModel(defaultModel);
        }
      } catch (err) {
        console.error('Failed to load chat resources:', err);
      }
    };

    void loadResources();
  }, []);

  // Subscribe to chat events
  useEffect(() => {
    const handleEvent = (event: ChatEvent): void => {
      // Only process events for current request
      setState((prev) => {
        if (event.requestId !== prev.currentRequestId) {
          return prev;
        }

        switch (event.type) {
          case 'text': {
            // Append text to the last assistant message + update contentBlocks
            const messages = [...prev.messages];
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant') {
              const blocks = lastMessage.contentBlocks ?? [];
              const lastBlock = blocks[blocks.length - 1] as ContentBlock | undefined;

              // If last block is text, append to it; otherwise create new text block
              let newBlocks: ContentBlock[];
              if (lastBlock?.type === 'text') {
                newBlocks = [
                  ...blocks.slice(0, -1),
                  { type: 'text', text: lastBlock.text + event.text },
                ];
              } else {
                newBlocks = [...blocks, { type: 'text', text: event.text }];
              }

              messages[messages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + event.text,
                contentBlocks: newBlocks,
              };
            }
            return { ...prev, messages };
          }

          case 'thinking': {
            // Could show thinking indicator, for now just log
            console.log('Thinking:', event.text);
            return prev;
          }

          case 'tool_call': {
            // Add tool call to the assistant message + contentBlocks
            const messages = [...prev.messages];
            const lastIndex = messages.length - 1;
            const lastMessage = messages[lastIndex] as ChatUIMessage | undefined;

            if (lastMessage?.role === 'assistant') {
              const toolCalls = lastMessage.toolCalls ? [...lastMessage.toolCalls] : [];
              const inputObj =
                typeof event.input === 'object' && event.input !== null
                  ? (event.input as Record<string, unknown>)
                  : {};
              const newToolCall: ToolCallUI = {
                id: event.toolCallId,
                name: event.name,
                input: inputObj,
                status: 'running',
              };
              toolCalls.push(newToolCall);

              // Add tool call as a content block
              const blocks = lastMessage.contentBlocks ?? [];
              const newBlocks: ContentBlock[] = [
                ...blocks,
                { type: 'tool_call', toolCall: newToolCall },
              ];

              messages[lastIndex] = {
                ...lastMessage,
                toolCalls,
                contentBlocks: newBlocks,
              };
            }
            return { ...prev, messages };
          }

          case 'tool_result': {
            // Update tool call with result in both toolCalls and contentBlocks
            const messages = [...prev.messages];
            const lastIndex = messages.length - 1;
            const lastMessage = messages[lastIndex] as ChatUIMessage | undefined;

            if (lastMessage?.role === 'assistant' && lastMessage.toolCalls) {
              const updatedResult = {
                content: formatToolResult(event.result),
                isError: event.isError ?? false,
              };
              const updatedStatus = (event.isError ? 'error' : 'completed') as ToolCallStatus;

              const toolCalls = lastMessage.toolCalls.map((tc) =>
                tc.id === event.toolCallId
                  ? { ...tc, status: updatedStatus, result: updatedResult }
                  : tc
              );

              // Also update in contentBlocks
              const contentBlocks = lastMessage.contentBlocks?.map((block) =>
                block.type === 'tool_call' && block.toolCall.id === event.toolCallId
                  ? {
                      ...block,
                      toolCall: { ...block.toolCall, status: updatedStatus, result: updatedResult },
                    }
                  : block
              );

              messages[lastIndex] = {
                ...lastMessage,
                toolCalls,
                contentBlocks,
              };
            }
            return { ...prev, messages };
          }

          case 'usage': {
            // Update usage on the assistant message
            const messages = [...prev.messages];
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant') {
              messages[messages.length - 1] = {
                ...lastMessage,
                usage: {
                  inputTokens: event.inputTokens,
                  outputTokens: event.outputTokens,
                },
              };
            }
            return { ...prev, messages };
          }

          case 'done': {
            // Mark streaming as complete
            const messages = [...prev.messages];
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant') {
              messages[messages.length - 1] = {
                ...lastMessage,
                isStreaming: false,
              };
            }
            return {
              ...prev,
              messages,
              isLoading: false,
              currentRequestId: null,
            };
          }

          case 'error': {
            // Handle error
            const messages = [...prev.messages];
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant') {
              messages[messages.length - 1] = {
                ...lastMessage,
                isStreaming: false,
                error: event.message,
              };
            }
            return {
              ...prev,
              messages,
              isLoading: false,
              error: event.message,
              currentRequestId: null,
            };
          }

          default:
            return prev;
        }
      });
    };

    unsubscribeRef.current = window.agentage.chat.onEvent(handleEvent);

    return (): void => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  // Subscribe to tools:change events for real-time sync
  useEffect(() => {
    unsubscribeToolsRef.current = window.agentage.tools.onChange((tools) => {
      setEnabledTools(tools);
    });

    return (): void => {
      if (unsubscribeToolsRef.current) {
        unsubscribeToolsRef.current();
        unsubscribeToolsRef.current = null;
      }
    };
  }, []);

  // Subscribe to models:change events for real-time sync
  useEffect(() => {
    unsubscribeModelsRef.current = window.agentage.models.onChange((newModels) => {
      setModels(newModels);
      // If selected model is no longer available, select first available or null
      if (selectedModel && !newModels.some((m) => m.id === selectedModel.id)) {
        const defaultModel =
          newModels.find((m) => m.id.includes('sonnet')) ?? (newModels[0] || null);
        setSelectedModel(defaultModel);
      }
    });

    return (): void => {
      if (unsubscribeModelsRef.current) {
        unsubscribeModelsRef.current();
        unsubscribeModelsRef.current = null;
      }
    };
  }, [selectedModel]);

  const sendMessage = useCallback(
    async (prompt: string): Promise<void> => {
      if (!prompt.trim() || state.isLoading) return;

      // Add user message
      const userMessage: ChatUIMessage = {
        id: `msg_${String(Date.now())}`,
        role: 'user',
        content: prompt,
        timestamp: new Date(),
      };

      // Add placeholder assistant message for streaming
      const assistantMessage: ChatUIMessage = {
        id: `msg_${String(Date.now() + 1)}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage, assistantMessage],
        isLoading: true,
        error: null,
      }));

      try {
        // Build config at send time - always fresh!
        const currentConfig = {
          model: selectedModel?.id ?? DEFAULT_MODEL,
          tools: enabledTools,
          agent: selectedAgent?.id,
          conversationId: state.conversationId ?? undefined,
        };

        const response: ChatSendResponse = await window.agentage.chat.send({
          prompt,
          config: currentConfig,
        });

        setState((prev) => ({
          ...prev,
          conversationId: response.conversationId,
          currentRequestId: response.requestId,
        }));
      } catch (err) {
        // On send failure, update the last assistant message with the error
        // instead of leaving an empty streaming message
        setState((prev) => {
          const messages = [...prev.messages];

          // If the last message is the empty assistant placeholder, attach error to it
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant' && lastMessage.isStreaming) {
              messages[messages.length - 1] = {
                ...lastMessage,
                isStreaming: false,
                error: err instanceof Error ? err.message : 'Failed to send message',
              };
            }
          }

          return {
            ...prev,
            messages,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Failed to send message',
          };
        });
      }
    },
    [state.isLoading, state.conversationId, selectedModel, enabledTools, selectedAgent]
  );

  const cancel = useCallback(() => {
    if (state.currentRequestId) {
      window.agentage.chat.cancel(state.currentRequestId);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        currentRequestId: null,
      }));
    }
  }, [state.currentRequestId]);

  const clear = useCallback(() => {
    window.agentage.chat.clear();
    setState({
      messages: [],
      isLoading: false,
      error: null,
      conversationId: null,
      currentRequestId: null,
    });
  }, []);

  const selectModel = useCallback(
    (modelId: string) => {
      const model = models.find((m) => m.id === modelId);
      if (model) {
        setSelectedModel(model);
      }
    },
    [models]
  );

  const selectAgent = useCallback(
    (agentId: string) => {
      if (agentId === 'none') {
        setSelectedAgent(null);
        return;
      }
      const agent = agents.find((a) => a.id === agentId);
      if (agent) {
        setSelectedAgent(agent);
      }
    },
    [agents]
  );

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    conversationId: state.conversationId,
    models,
    tools,
    enabledTools,
    agents,
    selectedModel,
    selectedAgent,
    sendMessage,
    cancel,
    clear,
    selectModel,
    selectAgent,
    setEnabledTools,
  };
};
