import { useCallback, useRef, useState } from 'react';

import { cn } from '../../lib/utils.js';

// Close icon
const CloseIcon = (): React.JSX.Element => (
  <svg
    className="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// Default, min, max widths for the chat panel
const DEFAULT_WIDTH = 384; // 24rem (w-96)
const MIN_WIDTH = 280;
const MAX_WIDTH = 600;

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Chat panel component - right side panel for AI chat
 *
 * Purpose: Provide a chat interface for interacting with AI agents
 * Currently a placeholder for future implementation
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

      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
        <h2 className="text-sm font-semibold text-foreground">Chat</h2>
        <button
          onClick={onClose}
          className="rounded-md p-1 hover:bg-card transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          title="Close chat"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Chat content - placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <svg
            className="size-8 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-foreground mb-2">Chat placeholder</h3>
        <p className="text-xs text-muted-foreground">Chat functionality coming soon</p>
      </div>

      {/* Input area - placeholder */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="What do you want to do?"
            disabled
            className="flex-1 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground placeholder:text-muted-foreground/50 cursor-not-allowed"
          />
          <button disabled className="rounded-md bg-primary/50 p-2 cursor-not-allowed" title="Send">
            <svg
              className="size-4 text-primary-foreground/50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};
