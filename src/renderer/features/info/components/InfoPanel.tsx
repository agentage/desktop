import { useCallback, useState, useRef } from 'react';
import { cn } from '../../../lib/utils.js';
import { useChat } from '../../chat/hooks/useChat.js';

// Close icon
const CloseIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// Info icon
const InfoIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

// Default, min, max widths for the info panel
const DEFAULT_WIDTH = 320;
const MIN_WIDTH = 280;
const MAX_WIDTH = 500;

interface InfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Info panel component - right side panel showing contextual information
 *
 * Purpose: Display contextual information about current chat session
 * Features: Resizable panel, shows models, agents, tools, and context stats
 */
export const InfoPanel = ({ isOpen, onClose }: InfoPanelProps): React.JSX.Element | null => {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isResizing = useRef(false);

  const { models, agents, tools, enabledTools, selectedModel, selectedAgent, conversationId } =
    useChat();

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

  const enabledToolsList = tools.filter((t) => enabledTools.includes(t.id));

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
        <div className="flex items-center gap-2">
          <InfoIcon />
          <h2 className="text-xs font-medium text-foreground">Info</h2>
        </div>
        <button
          onClick={onClose}
          className={cn(
            'flex size-7 items-center justify-center rounded-md',
            'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
            'focus:outline-none focus:text-foreground'
          )}
          title="Close info panel"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Session Info */}
        <section>
          <h3 className="text-xs font-medium text-muted-foreground mb-2">Session</h3>
          <div className="text-xs text-foreground space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span>{conversationId ? 'Active' : 'New'}</span>
            </div>
            {conversationId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-[10px]">{conversationId.slice(0, 8)}...</span>
              </div>
            )}
          </div>
        </section>

        {/* Model Info */}
        <section>
          <h3 className="text-xs font-medium text-muted-foreground mb-2">Model</h3>
          {selectedModel ? (
            <div className="text-xs space-y-1">
              <div className="font-medium text-foreground">{selectedModel.name}</div>
              <div className="text-muted-foreground">
                Provider: {selectedModel.provider}
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No model selected</div>
          )}
          {models.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              {models.length} model{models.length !== 1 ? 's' : ''} available
            </div>
          )}
        </section>

        {/* Agent Info */}
        <section>
          <h3 className="text-xs font-medium text-muted-foreground mb-2">Agent</h3>
          {selectedAgent ? (
            <div className="text-xs space-y-1">
              <div className="font-medium text-foreground">{selectedAgent.name}</div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No agent selected</div>
          )}
          {agents.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              {agents.length} agent{agents.length !== 1 ? 's' : ''} available
            </div>
          )}
        </section>

        {/* Tools Info */}
        <section>
          <h3 className="text-xs font-medium text-muted-foreground mb-2">Tools</h3>
          {enabledToolsList.length > 0 ? (
            <div className="space-y-1">
              {enabledToolsList.map((tool) => (
                <div key={tool.id} className="text-xs">
                  <div className="font-medium text-foreground">{tool.name}</div>
                  {tool.description && (
                    <div className="text-muted-foreground text-[11px]">{tool.description}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No tools enabled</div>
          )}
          {tools.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              {enabledToolsList.length} of {tools.length} enabled
            </div>
          )}
        </section>
      </div>
    </aside>
  );
};
