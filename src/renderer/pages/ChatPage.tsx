import React, { useCallback, useImperativeHandle, forwardRef } from 'react';

import { useChat } from '../features/chat/hooks/useChat.js';
import { ChatMessages } from '../features/chat/components/ChatMessages.js';
import { ComposerInput } from '../features/composer/index.js';
import { cn } from '../lib/utils.js';

// Clear/trash icon
const TrashIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

// Stop icon
const StopIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

// Panel left icon for toggling sidebar
const PanelLeftIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
  </svg>
);

// Panel right icon for toggling info panel
const PanelRightIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M15 3v18" />
  </svg>
);

export interface ChatPageHandle {
  loadConversation: (conversationId: string) => Promise<void>;
  clearChat: () => void;
}

interface ChatPageProps {
  onToggleInfoPanel?: () => void;
  onToggleSidebar?: () => void;
  isInfoPanelOpen?: boolean;
}

const ChatPageComponent = (
  { onToggleInfoPanel, onToggleSidebar, isInfoPanelOpen }: ChatPageProps,
  ref: React.Ref<ChatPageHandle>
): React.JSX.Element => {
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
    loadConversation,
  } = useChat();

  // Expose loadConversation and clearChat to parent via ref
  useImperativeHandle(ref, () => ({
    loadConversation,
    clearChat: clear,
  }));

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
    <section className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-sidebar px-3">
        <div className="flex items-center gap-2">
          {/* Sidebar toggle button */}
          <button
            onClick={onToggleSidebar}
            className={cn(
              'flex size-7 items-center justify-center rounded-md',
              'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
              'focus:outline-none'
            )}
            title="Toggle sidebar"
          >
            <PanelLeftIcon />
          </button>
          <div className="h-4 w-px bg-border" />
          <h2 className="text-xs font-medium text-foreground">Chat</h2>
        </div>
        <div className="flex items-center gap-1">
          {/* Stop button (when loading) */}
          {isLoading && (
            <button
              onClick={cancel}
              className={cn(
                'flex size-7 items-center justify-center rounded-md',
                'text-destructive hover:bg-destructive/10 transition-colors',
                'focus:outline-none'
              )}
              title="Stop generating"
            >
              <StopIcon />
            </button>
          )}
          {/* Clear button */}
          {messages.length > 0 && (
            <button
              onClick={clear}
              className={cn(
                'flex size-7 items-center justify-center rounded-md',
                'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
                'focus:outline-none'
              )}
              title="Clear chat"
            >
              <TrashIcon />
            </button>
          )}
          {/* Toggle info panel button */}
          <button
            onClick={onToggleInfoPanel}
            className={cn(
              'flex size-7 items-center justify-center rounded-md',
              'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
              'focus:outline-none',
              isInfoPanelOpen && 'text-foreground bg-accent'
            )}
            title={isInfoPanelOpen ? 'Close info panel' : 'Open info panel'}
          >
            <PanelRightIcon />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-3 py-2 bg-destructive/10 border-b border-destructive/20">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Chat messages */}
      <ChatMessages messages={messages} isLoading={isLoading} />

      {/* Composer input area */}
      <div className="p-3 border-t border-border">
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
    </section>
  );
};

/**
 * Chat page component - main chat interface
 *
 * Purpose: Primary interface for interacting with AI agents
 * Features: Full-height chat, composer input with model selector and context breakdown
 */
export const ChatPage = forwardRef<ChatPageHandle, ChatPageProps>(ChatPageComponent);
