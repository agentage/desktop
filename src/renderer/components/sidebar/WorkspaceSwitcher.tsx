import { useState } from 'react';
import { cn } from '../../lib/utils.js';

// Chevrons icon
const ChevronsUpDown = (): React.JSX.Element => (
  <svg
    className="ml-auto size-4"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </svg>
);

// Workspace icon
const WorkspaceIcon = (): React.JSX.Element => (
  <svg
    className="size-4"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
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
          'flex h-10 w-10 items-center justify-center rounded-lg mx-auto',
          'bg-primary text-primary-foreground cursor-pointer',
          'hover:opacity-90 transition-opacity'
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
          'flex w-full items-center gap-2 rounded-lg p-2 cursor-pointer',
          'hover:bg-card transition-colors',
          isOpen && 'bg-card'
        )}
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <WorkspaceIcon />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium text-foreground">{activeWorkspace.name}</span>
          <span className="truncate text-xs text-muted-foreground">{activeWorkspace.plan}</span>
        </div>
        <ChevronsUpDown />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
            }}
          />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-card p-1 shadow-lg">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Workspaces</div>
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => {
                  setActiveWorkspace(workspace);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md p-2 text-sm cursor-pointer',
                  'hover:bg-accent transition-colors',
                  activeWorkspace.id === workspace.id && 'bg-accent'
                )}
              >
                <div className="flex size-6 items-center justify-center rounded-md border border-border">
                  <WorkspaceIcon />
                </div>
                <span className="text-foreground">{workspace.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{workspace.plan}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
