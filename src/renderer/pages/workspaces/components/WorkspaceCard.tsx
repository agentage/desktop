/**
 * Workspace card component
 */
import { useEffect, useRef, useState } from 'react';
import type { Workspace } from '../../../../shared/types/workspace.types.js';
import {
  CheckIcon,
  EditIcon,
  IconButton,
  TrashIcon,
  WorkspaceIconDisplay,
  WORKSPACE_COLORS,
  WORKSPACE_ICONS,
  XIcon,
} from '../../../../shared/index.js';
import {
  Button,
  ColorPicker,
} from '../../../components/index.js';
import { cn } from '../../../lib/utils.js';

// Map WORKSPACE_COLORS to ColorPicker format
const WORKSPACE_COLOR_OPTIONS = WORKSPACE_COLORS.map((c) => ({
  id: c.id,
  value: c.value,
  label: c.label,
}));

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
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    if (!showIconPicker) return;

    const handleClickOutside = (e: MouseEvent): void => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowIconPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIconPicker]);

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
        <div className="relative" ref={pickerRef}>
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
            <div className="absolute top-12 left-0 z-50 p-3 rounded-lg shadow-xl w-[180px] border border-border bg-popover text-popover-foreground">
              {/* Color picker */}
              <div className="pb-3 border-b border-border mb-3">
                <ColorPicker
                  value={currentColor}
                  onChange={(colorId) => {
                    handleColorSelect(colorId);
                  }}
                  colors={WORKSPACE_COLOR_OPTIONS}
                  columns={5}
                />
              </div>

              {/* Icon picker - 5 columns */}
              <div className="grid grid-cols-5 gap-1.5">
                {WORKSPACE_ICONS.map((icon) => (
                  <button
                    key={icon.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIconSelect(icon.id);
                    }}
                    className={cn(
                      'flex size-6 items-center justify-center rounded hover:bg-accent transition-colors',
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
              <IconButton
                icon={<CheckIcon />}
                onClick={handleSave}
                className="text-green-500 hover:bg-green-500/10"
                title="Save"
              />
              <IconButton icon={<XIcon />} onClick={handleCancel} title="Cancel" />
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSwitch(workspace.id);
                }}
                className="text-primary"
              >
                Switch
              </Button>
            )}
            <IconButton
              icon={<EditIcon />}
              onClick={() => {
                setIsEditing(true);
              }}
              title="Rename"
            />
            {!workspace.isDefault && (
              <IconButton
                icon={<TrashIcon />}
                variant="destructive"
                onClick={() => {
                  onRemove(workspace.id);
                }}
                title="Remove"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
