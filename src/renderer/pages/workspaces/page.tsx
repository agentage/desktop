/**
 * WorkspacesPage - Workspace management
 */
import { useCallback, useEffect, useState } from 'react';
import type { Workspace } from '../../../shared/types/workspace.types.js';
import { FolderIcon } from '../../components/ui/index.js';
import { DropZone } from './DropZone.js';
import { WorkspaceCard } from './WorkspaceCard.js';

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

    // Subscribe to workspace list changes (e.g., from sidebar switcher)
    const unsubscribe = window.agentage.workspace.onListChanged((): void => {
      void loadWorkspaces();
    });

    return (): void => {
      unsubscribe();
    };
  }, [loadWorkspaces]);

  const handleSwitch = async (id: string): Promise<void> => {
    try {
      await window.agentage.workspace.switch(id);
      setActiveId(id);
    } catch (error) {
      console.error('Failed to switch workspace:', error);
    }
  };

  const handleUpdate = async (
    id: string,
    updates: { name?: string; icon?: string; color?: string }
  ): Promise<void> => {
    try {
      await window.agentage.workspace.update(id, updates);
      setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    } catch (error) {
      console.error('Failed to update workspace:', error);
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
    <div className="flex-1 p-6 h-full">
      <div className="max-w-2xl mx-auto space-y-6 pb-48">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FolderIcon />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Workspaces</h1>
        </div>

        <div className="space-y-3 relative">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              isActive={workspace.id === activeId}
              onSwitch={(id) => {
                void handleSwitch(id);
              }}
              onUpdate={(id, updates) => {
                void handleUpdate(id, updates);
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
