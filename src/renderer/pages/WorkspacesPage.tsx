import { useCallback, useEffect, useState } from 'react';
import type { Workspace } from '../../shared/types/workspace.types.js';
import { cn } from '../lib/utils.js';

// Icons
const FolderIcon = (): React.JSX.Element => (
  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const PlusIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CheckIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const EditIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

interface WorkspaceCardProps {
  workspace: Workspace;
  isActive: boolean;
  onSwitch: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

const WorkspaceCard = ({
  workspace,
  isActive,
  onSwitch,
  onRename,
  onRemove,
}: WorkspaceCardProps): React.JSX.Element => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(workspace.name);

  const handleSave = (): void => {
    if (editName.trim() && editName !== workspace.name) {
      onRename(workspace.id, editName.trim());
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

  return (
    <div
      className={cn(
        'rounded-lg border bg-sidebar p-4 transition-colors',
        isActive ? 'border-primary' : 'border-border hover:border-muted-foreground/50'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FolderIcon />
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

interface DropZoneProps {
  onDrop: (path: string) => void;
  onBrowse: () => void;
}

const DropZone = ({ onDrop, onBrowse }: DropZoneProps): React.JSX.Element => {
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

/**
 * WorkspacesPage - Workspace management
 */
export const WorkspacesPage = (): React.JSX.Element => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWorkspaces = useCallback(async (): Promise<void> => {
    try {
      const [list, active] = await Promise.all([
        window.agentage.workspace.list(),
        window.agentage.workspace.getActive(),
      ]);
      setWorkspaces(list);
      setActiveId(active?.id ?? null);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  const handleSwitch = async (id: string): Promise<void> => {
    try {
      await window.agentage.workspace.switch(id);
      setActiveId(id);
    } catch (error) {
      console.error('Failed to switch workspace:', error);
    }
  };

  const handleRename = async (id: string, name: string): Promise<void> => {
    try {
      await window.agentage.workspace.rename(id, name);
      setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, name } : w)));
    } catch (error) {
      console.error('Failed to rename workspace:', error);
    }
  };

  const handleRemove = async (id: string): Promise<void> => {
    try {
      await window.agentage.workspace.remove(id);
      await loadWorkspaces();
    } catch (error) {
      console.error('Failed to remove workspace:', error);
    }
  };

  const handleAdd = async (path: string): Promise<void> => {
    try {
      await window.agentage.workspace.add(path);
      await loadWorkspaces();
    } catch (error) {
      console.error('Failed to add workspace:', error);
    }
  };

  const handleBrowse = async (): Promise<void> => {
    try {
      const path = await window.agentage.workspace.browse();
      if (path) {
        await handleAdd(path);
      }
    } catch (error) {
      console.error('Failed to browse folder:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="text-sm text-muted-foreground">Loading workspaces...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            Manage your workspaces and switch between them
          </p>
        </div>

        <div className="space-y-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              isActive={workspace.id === activeId}
              onSwitch={(id) => {
                void handleSwitch(id);
              }}
              onRename={(id, name) => {
                void handleRename(id, name);
              }}
              onRemove={(id) => {
                void handleRemove(id);
              }}
            />
          ))}
        </div>

        <DropZone
          onDrop={(path) => {
            void handleAdd(path);
          }}
          onBrowse={() => {
            void handleBrowse();
          }}
        />
      </div>
    </div>
  );
};
