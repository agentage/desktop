import { useCallback, useEffect, useState } from 'react';

import { ChevronDownIcon, ChevronUpIcon } from './icons.js';

interface ToolInfo {
  name: string;
  description: string;
  source: 'builtin' | 'global' | 'workspace';
  status: 'ready' | 'warning' | 'error';
}

interface ToolItemProps {
  tool: ToolInfo;
  enabled: boolean;
  onToggle: (toolName: string) => void;
}

const ToolItem = ({ tool, enabled, onToggle }: ToolItemProps): React.JSX.Element => (
  <label className="flex items-start gap-2 py-1 px-2 hover:bg-accent/50 rounded cursor-pointer">
    <input
      type="checkbox"
      checked={enabled}
      onChange={() => {
        onToggle(tool.name);
      }}
      className="mt-0.5 size-3.5 rounded border-border accent-primary cursor-pointer"
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-foreground">{tool.name}</span>
        <span className="text-[10px] text-muted-foreground/70">({tool.source})</span>
      </div>
      <p className="text-[10px] text-muted-foreground truncate">{tool.description}</p>
    </div>
  </label>
);

interface ToolGroupData {
  id: string;
  name: string;
  tools: ToolInfo[];
  expanded: boolean;
}

interface ToolGroupSectionProps {
  group: ToolGroupData;
  enabledTools: string[];
  onToggleGroup: (groupId: string) => void;
  onToggleTool: (toolName: string) => void;
}

const ToolGroupSection = ({
  group,
  enabledTools,
  onToggleGroup,
  onToggleTool,
}: ToolGroupSectionProps): React.JSX.Element => {
  const enabledCount = group.tools.filter((t) => enabledTools.includes(t.name)).length;

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
              key={tool.name}
              tool={tool}
              enabled={enabledTools.includes(tool.name)}
              onToggle={onToggleTool}
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
 * Group tools by source for display
 */
const groupToolsBySource = (tools: ToolInfo[]): ToolGroupData[] => {
  const groups: Record<string, ToolInfo[]> = {
    builtin: [],
    global: [],
    workspace: [],
  };

  for (const tool of tools) {
    groups[tool.source].push(tool);
  }

  const result: ToolGroupData[] = [];

  if (groups.builtin.length > 0) {
    result.push({ id: 'builtin', name: 'Built-in', tools: groups.builtin, expanded: true });
  }
  if (groups.global.length > 0) {
    result.push({ id: 'global', name: 'Global', tools: groups.global, expanded: true });
  }
  if (groups.workspace.length > 0) {
    result.push({ id: 'workspace', name: 'Workspace', tools: groups.workspace, expanded: true });
  }

  return result;
};

/**
 * Tools popover component
 *
 * Loads tools from IPC and syncs changes back via IPC
 */
export const ToolsPopover = ({ isOpen, onClose }: ToolsPopoverProps): React.JSX.Element | null => {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [enabledTools, setEnabledTools] = useState<string[]>([]);
  const [toolGroups, setToolGroups] = useState<ToolGroupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tools from IPC when popover opens
  // Only show tools that are enabled in the settings (disabled tools are hidden)
  useEffect(() => {
    if (!isOpen) return;

    const loadTools = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const result = await window.agentage.tools.list();
        const enabledSet = new Set(result.settings.enabledTools);
        // Filter to only show enabled tools
        const enabledToolsList = result.tools.filter((t) => enabledSet.has(t.name));
        setTools(enabledToolsList);
        setEnabledTools(result.settings.enabledTools);
        setToolGroups(groupToolsBySource(enabledToolsList));
      } catch (error) {
        console.error('Failed to load tools:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadTools();
  }, [isOpen]);

  const handleToggleTool = useCallback(
    async (toolName: string): Promise<void> => {
      const newEnabled = enabledTools.includes(toolName)
        ? enabledTools.filter((t) => t !== toolName)
        : [...enabledTools, toolName];

      setEnabledTools(newEnabled);
      // Persist AND emit event via IPC
      await window.agentage.tools.updateSettings({ enabledTools: newEnabled });
    },
    [enabledTools]
  );

  const handleToggleGroup = useCallback((groupId: string): void => {
    setToolGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, expanded: !g.expanded } : g))
    );
  }, []);

  const handleEnableAll = useCallback(async (): Promise<void> => {
    const allToolNames = tools.map((t) => t.name);
    setEnabledTools(allToolNames);
    await window.agentage.tools.updateSettings({ enabledTools: allToolNames });
  }, [tools]);

  const handleDisableAll = useCallback(async (): Promise<void> => {
    setEnabledTools([]);
    await window.agentage.tools.updateSettings({ enabledTools: [] });
  }, []);

  if (!isOpen) return null;

  const totalTools = tools.length;
  const enabledCount = enabledTools.length;

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
                {enabledCount}/{totalTools} enabled
              </span>
              <button
                onClick={() => {
                  void handleEnableAll();
                }}
                className="text-[10px] text-primary hover:text-primary/80 transition-colors"
              >
                All
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                onClick={() => {
                  void handleDisableAll();
                }}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                None
              </button>
            </div>
          </div>

          {/* Tool groups */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                Loading tools...
              </div>
            ) : toolGroups.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                No tools available
              </div>
            ) : (
              toolGroups.map((group) => (
                <ToolGroupSection
                  key={group.id}
                  group={group}
                  enabledTools={enabledTools}
                  onToggleGroup={handleToggleGroup}
                  onToggleTool={(toolName) => {
                    void handleToggleTool(toolName);
                  }}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground/70">
              Tools from builtin and MCP servers · Changes apply immediately
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
