import { useCallback } from 'react';
import { useChat } from '../features/chat/hooks/useChat.js';
import { ChatMessages } from '../features/chat/components/ChatMessages.js';
import { ComposerInput } from '../features/composer/index.js';

/**
 * Chat page - Main chat interface
 * Route: /
 *
 * Purpose: Full-page chat interface for interacting with AI agents
 * Features: Message history, composer input with model/agent selector
 */
export const ChatPage = (): React.JSX.Element => {
  const {
    messages,
    isLoading,
    error,
    models,
    agents,
    selectedModel,
    selectedAgent,
    sendMessage,
    cancel,
    clear,
    selectModel,
    selectAgent,
  } = useChat();

  const handleSubmit = useCallback(
    (message: string): void => {
      void sendMessage(message);
    },
    [sendMessage]
  );

  const handleModelChange = useCallback(
    (model: { id: string }) => {
      selectModel(model.id);
    },
    [selectModel]
  );

  const handleAgentChange = useCallback(
    (agent: { id: string }) => {
      selectAgent(agent.id);
    },
    [selectAgent]
  );

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </div>

      {/* Action bar - Clear and Stop buttons */}
      {(messages.length > 0 || isLoading) && (
        <div className="flex items-center justify-end gap-2 px-4 py-2 border-t border-border">
          {isLoading && (
            <button
              onClick={cancel}
              className="px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
              Stop
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={clear}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Composer input area */}
      <div className="p-4 border-t border-border">
        <ComposerInput
          onSubmit={handleSubmit}
          placeholder="How could I help you today?"
          disabled={isLoading}
          models={models.map((m) => ({ id: m.id, name: m.name, provider: m.provider }))}
          selectedModel={
            selectedModel
              ? { id: selectedModel.id, name: selectedModel.name, provider: selectedModel.provider }
              : {
                  id: 'claude-sonnet-4-5-20250929',
                  name: 'claude-sonnet-4-5-20250929',
                  provider: 'anthropic',
                }
          }
          onModelChange={handleModelChange}
          agents={agents.map((a) => ({ id: a.id, name: a.name }))}
          selectedAgent={
            selectedAgent ? { id: selectedAgent.id, name: selectedAgent.name } : undefined
          }
          onAgentChange={handleAgentChange}
          conversationTokens={messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0)}
        />
      </div>
    </div>
  );
};
