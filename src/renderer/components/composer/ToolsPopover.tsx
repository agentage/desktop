import { useState } from 'react';

import { ChevronDownIcon, ChevronUpIcon } from './icons.js';
import type { ToolGroup, ToolOption } from './types.js';

// Mock data - would come from MCP servers in production
const INITIAL_TOOL_GROUPS: ToolGroup[] = [
  {
    id: 'built-in',
    name: 'Built-In',
    expanded: true,
    tools: [
      { id: 'agent', name: 'agent', description: 'Delegate tasks to other agents', enabled: true },
      {
        id: 'runSubagent',
        name: 'runSubagent',
        description: 'Run a task within an isolated subagent context',
        enabled: true,
      },
      { id: 'edit', name: 'edit', description: 'Edit files in your workspace', enabled: true },
      {
        id: 'createDirectory',
        name: 'createDirectory',
        description: 'Create new directories in your workspace',
        enabled: true,
      },
      { id: 'createFile', name: 'createFile', description: 'Create new files', enabled: true },
      {
        id: 'createJupyterNotebook',
        name: 'createJupyterNotebook',
        description: 'Create a new Jupyter Notebook',
        enabled: true,
      },
      { id: 'editFiles', name: 'editFiles', description: 'Edit files', enabled: true },
      {
        id: 'editNotebook',
        name: 'editNotebook',
        description: 'Edit a notebook file in the workspace',
        enabled: true,
      },
    ],
  },
  {
    id: 'execute',
    name: 'Execute',
    expanded: true,
    tools: [
      {
        id: 'execute',
        name: 'execute',
        description: 'Execute code and applications on your machine',
        enabled: true,
      },
      {
        id: 'createAndRunTask',
        name: 'createAndRunTask',
        description: 'Create and run a task in the workspace',
        enabled: true,
      },
      {
        id: 'getTaskOutput',
        name: 'getTaskOutput',
        description: 'Get the output of a task',
        enabled: true,
      },
      {
        id: 'getTerminalOutput',
        name: 'getTerminalOutput',
        description: 'Get the output of a terminal command',
        enabled: true,
      },
      {
        id: 'runInTerminal',
        name: 'runInTerminal',
        description: 'Run commands in the terminal',
        enabled: true,
      },
      {
        id: 'runNotebookCell',
        name: 'runNotebookCell',
        description: 'Trigger the execution of a cell in a notebook file',
        enabled: true,
      },
      { id: 'runTask', name: 'runTask', description: 'Run tasks in the workspace', enabled: true },
      {
        id: 'runTests',
        name: 'runTests',
        description: 'Run unit tests (optionally with coverage)',
        enabled: true,
      },
    ],
  },
];

interface ToolItemProps {
  tool: ToolOption;
  onToggle: (toolId: string) => void;
}

const ToolItem = ({ tool, onToggle }: ToolItemProps): React.JSX.Element => (
  <label className="flex items-start gap-2 py-1 px-2 hover:bg-accent/50 rounded cursor-pointer">
    <input
      type="checkbox"
      checked={tool.enabled}
      onChange={() => {
        onToggle(tool.id);
      }}
      className="mt-0.5 size-3.5 rounded border-border accent-primary cursor-pointer"
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-foreground">{tool.name}</span>
      </div>
      <p className="text-[10px] text-muted-foreground truncate">{tool.description}</p>
    </div>
  </label>
);

interface ToolGroupSectionProps {
  group: ToolGroup;
  onToggleGroup: (groupId: string) => void;
  onToggleTool: (groupId: string, toolId: string) => void;
}

const ToolGroupSection = ({
  group,
  onToggleGroup,
  onToggleTool,
}: ToolGroupSectionProps): React.JSX.Element => {
  const enabledCount = group.tools.filter((t) => t.enabled).length;

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => {
          onToggleGroup(group.id);
        }}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {group.expanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
          <span className="text-xs font-semibold text-foreground">{group.name}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {enabledCount}/{group.tools.length}
        </span>
      </button>

      {group.expanded && (
        <div className="pb-2 px-1">
          {group.tools.map((tool) => (
            <ToolItem
              key={tool.id}
              tool={tool}
              onToggle={(toolId) => {
                onToggleTool(group.id, toolId);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ToolsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Tools popover component
 *
 * Shows list of available tools grouped by type with checkboxes to enable/disable
 */
export const ToolsPopover = ({ isOpen, onClose }: ToolsPopoverProps): React.JSX.Element | null => {
  const [toolGroups, setToolGroups] = useState<ToolGroup[]>(INITIAL_TOOL_GROUPS);

  if (!isOpen) return null;

  const totalTools = toolGroups.reduce((acc, g) => acc + g.tools.length, 0);
  const enabledTools = toolGroups.reduce(
    (acc, g) => acc + g.tools.filter((t) => t.enabled).length,
    0
  );

  const handleToggleGroup = (groupId: string): void => {
    setToolGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, expanded: !g.expanded } : g))
    );
  };

  const handleToggleTool = (groupId: string, toolId: string): void => {
    setToolGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              tools: g.tools.map((t) => (t.id === toolId ? { ...t, enabled: !t.enabled } : t)),
            }
          : g
      )
    );
  };

  const handleEnableAll = (): void => {
    setToolGroups((prev) =>
      prev.map((g) => ({
        ...g,
        tools: g.tools.map((t) => ({ ...t, enabled: true })),
      }))
    );
  };

  const handleDisableAll = (): void => {
    setToolGroups((prev) =>
      prev.map((g) => ({
        ...g,
        tools: g.tools.map((t) => ({ ...t, enabled: false })),
      }))
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20"
        onClick={() => {
          onClose();
        }}
      />

      {/* Popover */}
      <div className="absolute bottom-full left-0 right-0 mb-2 z-[60] mx-2">
        <div className="rounded-lg border border-border bg-sidebar shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Tools</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {enabledTools}/{totalTools} enabled
              </span>
              <button
                onClick={handleEnableAll}
                className="text-[10px] text-primary hover:text-primary/80 transition-colors"
              >
                All
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                onClick={handleDisableAll}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                None
              </button>
            </div>
          </div>

          {/* Tool groups */}
          <div className="max-h-80 overflow-y-auto">
            {toolGroups.map((group) => (
              <ToolGroupSection
                key={group.id}
                group={group}
                onToggleGroup={handleToggleGroup}
                onToggleTool={handleToggleTool}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground/70">
              Tools from MCP servers · Changes apply to next message
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
