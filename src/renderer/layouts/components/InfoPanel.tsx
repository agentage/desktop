import React, { useCallback, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '../../lib/utils.js';

// Close icon
const CloseIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// Default, min, max widths for the info panel
const DEFAULT_WIDTH = 400;
const MIN_WIDTH = 300;
const MAX_WIDTH = 600;

interface InfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

/**
 * Info panel component - right side panel for contextual information
 *
 * Purpose: Display contextual info based on current navigation selection
 * Features: Resizable panel, renders router outlet for page content
 */
export const InfoPanel = ({ isOpen, onClose, title = 'Info' }: InfoPanelProps): React.JSX.Element | null => {
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
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-sidebar-border px-3">
        <h2 className="text-xs font-medium text-foreground">{title}</h2>
        <div className="flex items-center gap-1">
          {/* Close button */}
          <button
            onClick={onClose}
            className={cn(
              'flex size-7 items-center justify-center rounded-md',
              'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
              'focus:outline-none focus:text-foreground'
            )}
            title="Close panel"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Content - renders router outlet */}
      <div className="flex-1 overflow-auto p-4">
        <Outlet />
      </div>
    </aside>
  );
};
