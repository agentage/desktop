import { useState } from 'react';
import { cn } from '../lib/utils.js';
import { PlusIcon } from './icons.js';

export interface DropZoneProps {
  /** Callback when a file/folder is dropped */
  onDrop: (path: string) => void;
  /** Callback when browse is clicked */
  onBrowse: () => void;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Primary text */
  text?: string;
  /** Secondary text/hint */
  hint?: string;
  /** Whether the drop zone is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * DropZone - Drag-and-drop area for adding items
 *
 * @example
 * <DropZone
 *   onDrop={handleAdd}
 *   onBrowse={handleBrowse}
 *   text="Drop folder here"
 *   hint="or browse"
 * />
 */
export const DropZone = ({
  onDrop,
  onBrowse,
  icon,
  text = 'Drop folder here',
  hint = 'or browse',
  disabled,
  className,
}: DropZoneProps): React.JSX.Element => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent): void => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent): void => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // In Electron, dropped folders have a path property
      const path = (file as File & { path?: string }).path;
      if (path) {
        onDrop(path);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={onBrowse}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      disabled={disabled}
      className={cn(
        'w-full rounded-lg border-2 border-dashed p-6 text-center transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground/50 hover:bg-muted/50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          {icon ?? <PlusIcon />}
        </div>
        <div className="text-sm text-muted-foreground">
          {text} <span className="text-primary">{hint}</span>
        </div>
      </div>
    </button>
  );
};
