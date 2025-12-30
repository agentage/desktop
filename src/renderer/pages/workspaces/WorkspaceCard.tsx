/**
 * Workspace card component
 */
import { useState } from 'react';
import type { Workspace } from '../../../shared/types/workspace.types.js';
import { cn } from '../../lib/utils.js';
import { WORKSPACE_COLORS, WORKSPACE_ICONS } from './constants.js';
import { CheckIcon, EditIcon, TrashIcon, XIcon } from './icons.js';
import { WorkspaceIconDisplay } from './WorkspaceIconDisplay.js';

export interface WorkspaceCardProps {
  workspace: Workspace;
  isActive: boolean;
  onSwitch: (id: string) => void;
  onUpdate: (id: string, updates: { name?: string; icon?: string; color?: string }) => void;
  onRemove: (id: string) => void;
}

export const WorkspaceCard = ({
  workspace,
  isActive,
  onSwitch,
  onUpdate,
  onRemove,
}: WorkspaceCardProps): React.JSX.Element => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(workspace.name);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleSave = (): void => {
    if (editName.trim() && editName !== workspace.name) {
      onUpdate(workspace.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    setEditName(workspace.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  const handleColorSelect = (colorId: string): void => {
    onUpdate(workspace.id, { color: colorId });
  };

  const handleIconSelect = (iconId: string): void => {
    onUpdate(workspace.id, { icon: iconId });
  };

  const currentColor = workspace.color ?? 'slate';

  return (
    <div
      className={cn(
        'rounded-lg border bg-sidebar p-4 transition-colors',
        isActive ? 'border-primary' : 'border-border hover:border-muted-foreground/50'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <button
            onClick={() => {
              setShowIconPicker(!showIconPicker);
            }}
            className="flex size-10 items-center justify-center rounded-md bg-muted hover:bg-muted/80 transition-colors"
            title="Change icon & color"
          >
            <WorkspaceIconDisplay icon={workspace.icon} color={workspace.color} />
          </button>

          {showIconPicker && (
            <div className="absolute top-12 left-0 z-10 p-3 bg-popover border border-border rounded-lg shadow-lg min-w-[200px]">
              {/* Color picker */}
              <div className="flex gap-1.5 pb-3 border-b border-border mb-3">
                {WORKSPACE_COLORS.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => {
                      handleColorSelect(color.id);
                    }}
                    className={cn(
                      'size-6 rounded-full transition-all',
                      currentColor === color.id &&
                        'ring-2 ring-offset-2 ring-offset-popover ring-foreground'
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>

              {/* Icon picker */}
              <div className="grid grid-cols-5 gap-1">
                {WORKSPACE_ICONS.map((icon) => (
                  <button
                    key={icon.id}
                    onClick={() => {
                      handleIconSelect(icon.id);
                    }}
                    className={cn(
                      'flex size-8 items-center justify-center rounded hover:bg-accent transition-colors',
                      workspace.icon === icon.id && 'bg-accent'
                    )}
                    title={icon.label}
                  >
                    <WorkspaceIconDisplay icon={icon.id} color={currentColor} className="size-4" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:border-primary"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                title="Save"
              >
                <CheckIcon />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-muted-foreground hover:bg-muted rounded"
                title="Cancel"
              >
                <XIcon />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-foreground truncate">{workspace.name}</h3>
              {isActive && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">
                  Active
                </span>
              )}
              {workspace.isDefault && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded">
                  Default
                </span>
              )}
            </div>
          )}
          <p className="mt-1 text-xs text-muted-foreground truncate" title={workspace.path}>
            {workspace.path}
          </p>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1">
            {!isActive && (
              <button
                onClick={() => {
                  onSwitch(workspace.id);
                }}
                className="px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded transition-colors"
              >
                Switch
              </button>
            )}
            <button
              onClick={() => {
                setIsEditing(true);
              }}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              title="Rename"
            >
              <EditIcon />
            </button>
            {!workspace.isDefault && (
              <button
                onClick={() => {
                  onRemove(workspace.id);
                }}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                title="Remove"
              >
                <TrashIcon />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
