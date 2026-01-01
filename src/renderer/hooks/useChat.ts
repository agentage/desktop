import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ChatAgentInfo,
  ChatEvent,
  ChatModelInfo,
  ChatSendResponse,
  ChatToolInfo,
  SessionConfig,
} from '../../shared/types/chat.types.js';

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
  /** Available agents */
  agents: ChatAgentInfo[];
  /** Currently selected model */
  selectedModel: ChatModelInfo | null;
  /** Configure the chat session */
  configure: (config: Partial<SessionConfig>) => void;
  /** Send a message */
  sendMessage: (prompt: string) => Promise<void>;
  /** Cancel current request */
  cancel: () => void;
  /** Clear chat history */
  clear: () => void;
  /** Select a model */
  selectModel: (modelId: string) => void;
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
  const [agents, setAgents] = useState<ChatAgentInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<ChatModelInfo | null>(null);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({
    model: DEFAULT_MODEL,
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load available models, tools, agents on mount
  useEffect(() => {
    const loadResources = async (): Promise<void> => {
      try {
        const [loadedModels, loadedTools, loadedAgents] = await Promise.all([
          window.agentage.chat.getModels(),
          window.agentage.chat.getTools(),
          window.agentage.chat.getAgents(),
        ]);

        setModels(loadedModels);
        setTools(loadedTools);
        setAgents(loadedAgents);

        // Set default selected model
        if (loadedModels.length > 0) {
          const defaultModel = loadedModels.find((m) => m.id.includes('sonnet')) ?? loadedModels[0];
          setSelectedModel(defaultModel);
          setSessionConfig((prev) => ({ ...prev, model: defaultModel.id }));
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
            // Append text to the last assistant message
            const messages = [...prev.messages];
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant') {
              messages[messages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + event.text,
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
            // Could show tool call indicator
            console.log('Tool call:', event.name, event.input);
            return prev;
          }

          case 'tool_result': {
            // Could show tool result
            console.log('Tool result:', event.name, event.result);
            return prev;
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

  // Configure session when config changes
  useEffect(() => {
    window.agentage.chat.configure(sessionConfig);
  }, [sessionConfig]);

  const configure = useCallback((config: Partial<SessionConfig>) => {
    setSessionConfig((prev) => ({ ...prev, ...config }));
  }, []);

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
        const response: ChatSendResponse = await window.agentage.chat.send({ prompt });

        setState((prev) => ({
          ...prev,
          conversationId: response.conversationId,
          currentRequestId: response.requestId,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to send message',
        }));
      }
    },
    [state.isLoading]
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
        setSessionConfig((prev) => ({ ...prev, model: modelId }));
      }
    },
    [models]
  );

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    conversationId: state.conversationId,
    models,
    tools,
    agents,
    selectedModel,
    configure,
    sendMessage,
    cancel,
    clear,
    selectModel,
  };
};
