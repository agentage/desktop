import { useCallback, useRef, useState } from 'react';

import { cn } from '../../lib/utils.js';
import { ComposerInput } from '../composer/index.js';

// Close icon
const CloseIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// Chat icon for messages
const ChatIcon = (): React.JSX.Element => (
  <svg
    className="size-8 text-muted-foreground"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

  const handleSubmit = (message: string): void => {
    // TODO: Implement actual message handling
    console.log('Message submitted:', message);
  };

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

      {/* Chat content - messages area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
        <div className="mb-4 rounded-full bg-muted p-4">
          <ChatIcon />
        </div>
        <h3 className="text-sm font-medium text-foreground mb-2">Start a conversation</h3>
        <p className="text-xs text-muted-foreground">Type a message below to begin</p>
      </div>

      {/* Composer input area */}
      <div className="p-3">
        <ComposerInput onSubmit={handleSubmit} placeholder="How could I help you today?" />
      </div>
    </aside>
  );
};
