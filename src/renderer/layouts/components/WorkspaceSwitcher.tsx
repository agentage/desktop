import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Workspace } from '../../../shared/types/workspace.types.js';
import { cn } from '../../lib/utils.js';
import { WorkspaceIconDisplay } from '../../pages/workspaces/components/WorkspaceIconDisplay.js';

// Chevron down icon (matching composer style)
const ChevronDownIcon = (): React.JSX.Element => (
  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// Check icon for selected item
const CheckIcon = (): React.JSX.Element => (
  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface WorkspaceSwitcherProps {
  isCollapsed?: boolean;
}

/**
 * Workspace switcher component for sidebar header
 * Allows switching between different workspaces
 */
export const WorkspaceSwitcher = ({
  isCollapsed = false,
}: WorkspaceSwitcherProps): React.JSX.Element => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const loadWorkspaces = useCallback(async (): Promise<void> => {
    try {
      const [list, active] = await Promise.all([
        window.agentage.workspace.list(),
        window.agentage.workspace.getActive(),
      ]);
      setWorkspaces(list);
      setActiveWorkspace(active);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    }
  }, []);

  useEffect(() => {
    void loadWorkspaces();

    // Subscribe to workspace list changes
    const unsubscribe = window.agentage.workspace.onListChanged((): void => {
      void loadWorkspaces();
    });

    return (): void => {
      unsubscribe();
    };
  }, [loadWorkspaces]);

  const handleSwitchWorkspace = async (id: string): Promise<void> => {
    try {
      await window.agentage.workspace.switch(id);
      const workspace = workspaces.find((w) => w.id === id);
      if (workspace) setActiveWorkspace(workspace);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch workspace:', error);
    }
  };

  if (isCollapsed) {
    return (
      <div className="relative">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          className={cn(
            'flex size-8 items-center justify-center rounded-md mx-auto',
            'bg-muted',
            'hover:bg-accent transition-colors',
            'focus:outline-none',
            isOpen && 'bg-accent'
          )}
          title={activeWorkspace?.name ?? 'No workspace'}
          aria-label="Switch workspace"
          aria-expanded={isOpen}
        >
          <WorkspaceIconDisplay
            icon={activeWorkspace?.icon}
            color={activeWorkspace?.color}
            className="size-4"
          />
        </button>

        {/* Dropdown for collapsed state */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-50 bg-black/20"
              onClick={() => {
                setIsOpen(false);
              }}
              aria-hidden="true"
            />

            {/* Dropdown menu */}
            <div 
              className="absolute left-0 top-full mt-1 z-[60] rounded-md border border-border bg-sidebar shadow-lg min-w-48"
              role="menu"
              aria-label="Workspace selection menu"
            >
              <div className="p-1">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Workspaces
                </div>
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => {
                      void handleSwitchWorkspace(workspace.id);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm',
                      'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left',
                      activeWorkspace?.id === workspace.id && 'bg-accent/50'
                    )}
                    role="menuitem"
                    aria-current={activeWorkspace?.id === workspace.id ? 'true' : undefined}
                  >
                    <div className="flex size-5 items-center justify-center rounded-sm bg-muted/50">
                      <WorkspaceIconDisplay
                        icon={workspace.icon}
                        color={workspace.color}
                        className="size-3.5"
                      />
                    </div>
                    <span className="flex-1 truncate">{workspace.name}</span>
                    {workspace.isDefault && (
                      <span className="text-[10px] text-muted-foreground">Default</span>
                    )}
                    {activeWorkspace?.id === workspace.id && (
                      <span className="text-primary">
                        <CheckIcon />
                      </span>
                    )}
                  </button>
                ))}
                <div className="my-1 h-px bg-border" />
                <button
                  onClick={() => {
                    setIsOpen(false);
                    void navigate('/workspaces');
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left"
                >
                  Manage workspaces...
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className={cn(
          'flex w-full items-center gap-2 rounded-md p-2',
          'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
          'focus:outline-none focus:text-foreground',
          isOpen && 'bg-accent text-foreground'
        )}
      >
        <div className="flex size-8 items-center justify-center rounded-md bg-muted">
          <WorkspaceIconDisplay
            icon={activeWorkspace?.icon}
            color={activeWorkspace?.color}
            className="size-4"
          />
        </div>
        <div className="grid flex-1 text-left leading-tight">
          <span className="truncate text-xs font-medium text-foreground">
            {activeWorkspace?.name ?? 'No workspace'}
          </span>
          <span className="truncate text-[10px] text-muted-foreground">
            {activeWorkspace?.path ? activeWorkspace.path.split('/').pop() : 'Select workspace'}
          </span>
        </div>
        <ChevronDownIcon />
      </button>

      {/* Dropdown - styled like composer ModelSelector */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/20"
            onClick={() => {
              setIsOpen(false);
            }}
          />

          {/* Dropdown menu */}
          <div className="absolute left-0 right-0 top-full mt-1 z-[60] rounded-md border border-border bg-sidebar shadow-lg">
            <div className="p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Workspaces
              </div>
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    void handleSwitchWorkspace(workspace.id);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm',
                    'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left',
                    activeWorkspace?.id === workspace.id && 'bg-accent/50'
                  )}
                >
                  <div className="flex size-5 items-center justify-center rounded-sm bg-muted/50">
                    <WorkspaceIconDisplay
                      icon={workspace.icon}
                      color={workspace.color}
                      className="size-3.5"
                    />
                  </div>
                  <span className="flex-1 truncate">{workspace.name}</span>
                  {workspace.isDefault && (
                    <span className="text-[10px] text-muted-foreground">Default</span>
                  )}
                  {activeWorkspace?.id === workspace.id && (
                    <span className="text-primary">
                      <CheckIcon />
                    </span>
                  )}
                </button>
              ))}
              <div className="my-1 h-px bg-border" />
              <button
                onClick={() => {
                  setIsOpen(false);
                  void navigate('/workspaces');
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left"
              >
                Manage workspaces...
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
