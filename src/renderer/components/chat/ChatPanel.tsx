import { useCallback, useRef, useState } from 'react';

import { useChat } from '../../hooks/useChat.js';
import { cn } from '../../lib/utils.js';
import { ComposerInput } from '../composer/index.js';
import { ChatMessages } from './ChatMessages.js';

// Close icon
const CloseIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

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

// Default, min, max widths for the chat panel
const DEFAULT_WIDTH = 420;
const MIN_WIDTH = 320;
const MAX_WIDTH = 700;

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Chat panel component - right side panel for AI chat
 *
 * Purpose: Provide a chat interface for interacting with AI agents
 * Features: Resizable panel, composer input with model selector and context breakdown
 */
export const ChatPanel = ({ isOpen, onClose }: ChatPanelProps): React.JSX.Element | null => {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isResizing = useRef(false);

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

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isResizing.current = true;

      const startX = e.clientX;
      const startWidth = width;

      const handleMouseMove = (moveEvent: MouseEvent): void => {
        if (!isResizing.current) return;
        // Resize from left edge, so moving left increases width
        const delta = startX - moveEvent.clientX;
        const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
        setWidth(newWidth);
      };

      const handleMouseUp = (): void => {
        isResizing.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [width]
  );

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

  if (!isOpen) return null;

  return (
    <aside
      style={{ width }}
      className={cn(
        'relative flex flex-col bg-sidebar border-l border-sidebar-border',
        'select-none'
      )}
    >
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/50 transition-colors z-10"
      />

      {/* Header - matches SiteHeader height */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-sidebar-border px-3">
        <h2 className="text-xs font-medium text-foreground">Chat</h2>
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
          {/* Close button */}
          <button
            onClick={onClose}
            className={cn(
              'flex size-7 items-center justify-center rounded-md',
              'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
              'focus:outline-none focus:text-foreground'
            )}
            title="Close chat"
          >
            <CloseIcon />
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
      <div className="p-3">
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
    </aside>
  );
};
