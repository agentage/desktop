import { useState } from 'react';
import { cn } from '../../lib/utils.js';

// Chevron down icon (matching composer style)
const ChevronDownIcon = (): React.JSX.Element => (
  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// Workspace icon
const WorkspaceIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

// Check icon for selected item
const CheckIcon = (): React.JSX.Element => (
  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface Workspace {
  id: string;
  name: string;
  plan: string;
}

interface WorkspaceSwitcherProps {
  isCollapsed?: boolean;
}

const workspaces: Workspace[] = [
  { id: '1', name: 'Personal', plan: 'Free' },
  { id: '2', name: 'Acme Inc', plan: 'Pro' },
];

/**
 * Workspace switcher component for sidebar header
 * Allows switching between different workspaces/teams
 */
export const WorkspaceSwitcher = ({
  isCollapsed = false,
}: WorkspaceSwitcherProps): React.JSX.Element => {
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0]);
  const [isOpen, setIsOpen] = useState(false);

  if (isCollapsed) {
    return (
      <button
        className={cn(
          'flex size-8 items-center justify-center rounded-md mx-auto',
          'bg-primary/10 text-primary',
          'hover:bg-accent transition-colors',
          'focus:outline-none'
        )}
        title={activeWorkspace.name}
      >
        <WorkspaceIcon />
      </button>
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
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <WorkspaceIcon />
        </div>
        <div className="grid flex-1 text-left leading-tight">
          <span className="truncate text-xs font-medium text-foreground">
            {activeWorkspace.name}
          </span>
          <span className="truncate text-[10px] text-muted-foreground">{activeWorkspace.plan}</span>
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
                    setActiveWorkspace(workspace);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm',
                    'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left',
                    activeWorkspace.id === workspace.id && 'bg-accent/50'
                  )}
                >
                  <div className="flex size-5 items-center justify-center rounded-sm bg-muted/50">
                    <WorkspaceIcon />
                  </div>
                  <span className="flex-1 truncate">{workspace.name}</span>
                  <span className="text-[10px] text-muted-foreground">{workspace.plan}</span>
                  {activeWorkspace.id === workspace.id && (
                    <span className="text-primary">
                      <CheckIcon />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
