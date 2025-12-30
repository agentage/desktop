/**
 * Drop zone component for adding workspaces
 */
import { useState } from 'react';
import { cn } from '../../lib/utils.js';
import { PlusIcon } from './icons.js';

export interface DropZoneProps {
  onDrop: (path: string) => void;
  onBrowse: () => void;
}

export const DropZone = ({ onDrop, onBrowse }: DropZoneProps): React.JSX.Element => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent): void => {
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
      onClick={onBrowse}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'w-full rounded-lg border-2 border-dashed p-6 text-center transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground/50 hover:bg-muted/50'
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <PlusIcon />
        </div>
        <div className="text-sm text-muted-foreground">
          Drop folder here or <span className="text-primary">browse</span>
        </div>
      </div>
    </button>
  );
};
