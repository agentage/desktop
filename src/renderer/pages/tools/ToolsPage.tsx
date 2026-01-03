import { useCallback, useEffect, useState } from 'react';
import type { TabFilter, ToolInfo, ToolSource } from '../../../shared/types/index.js';
import { ToolCard } from './components/ToolCard.js';
import {
  IconButton,
  RefreshIcon,
  ToggleGroup,
  WrenchIcon,
  type ToggleOption,
} from '../../components/index.js';
import { cn } from '../../lib/utils.js';

/**
 * Tab options for filtering tools by source
 */
const TAB_OPTIONS: ToggleOption<TabFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'builtin', label: 'Builtin' },
  { value: 'global', label: 'Global' },
  { value: 'workspace', label: 'Workspace' },
];

/**
 * ToolsPage - Tool management interface
 *
 * Displays available tools with filtering by source.
 * Phase 1: Builtin tools only, Global/Workspace show empty state.
 */
export const ToolsPage = (): React.JSX.Element => {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [enabledTools, setEnabledTools] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Load tools from main process
   */
  const loadTools = useCallback(async (): Promise<void> => {
    try {
      const result = await window.agentage.tools.list();
      setTools(result.tools);
      setEnabledTools(new Set(result.settings.enabledTools));
    } catch (error) {
      console.error('Failed to load tools:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load tools on mount
   */
  useEffect(() => {
    void loadTools();
  }, [loadTools]);

  /**
   * Handle refresh button click
   */
  const handleRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      await loadTools();
    } finally {
      setRefreshing(false);
    }
  }, [loadTools]);

  /**
   * Handle tool enable/disable toggle
   */
  const handleToggle = useCallback(
    async (toolName: string, enabled: boolean): Promise<void> => {
      // Optimistic update
      const newEnabledTools = new Set(enabledTools);
      if (enabled) {
        newEnabledTools.add(toolName);
      } else {
        newEnabledTools.delete(toolName);
      }
      setEnabledTools(newEnabledTools);

      // Persist to backend
      try {
        await window.agentage.tools.updateSettings({
          enabledTools: Array.from(newEnabledTools),
        });
      } catch (error) {
        console.error('Failed to update tool settings:', error);
        // Revert on error
        setEnabledTools(enabledTools);
      }
    },
    [enabledTools]
  );

  /**
   * Filter tools by active tab
   */
  const filteredTools = tools.filter((tool) => {
    if (activeTab === 'all') return true;
    return tool.source === activeTab;
  });

  /**
   * Calculate statistics
   */
  const totalCount = filteredTools.length;
  const enabledCount = filteredTools.filter((t) => enabledTools.has(t.name)).length;

  /**
   * Check if tab has tools (for empty state)
   */
  const hasToolsForTab = (tab: TabFilter): boolean => {
    if (tab === 'all') return tools.length > 0;
    return tools.some((t) => t.source === tab);
  };

  /**
   * Render empty state for a tab
   */
  const renderEmptyState = (source: ToolSource | 'all'): React.JSX.Element => {
    const messages: Record<ToolSource | 'all', { title: string; description: string }> = {
      all: {
        title: 'No tools available',
        description: 'Tools will appear here when available.',
      },
      builtin: {
        title: 'No builtin tools',
        description: 'Builtin tools are compiled with the app.',
      },
      global: {
        title: 'No global tools',
        description: 'Add tools to ~/.agentage/plugins/ (Phase 2)',
      },
      workspace: {
        title: 'No workspace tools',
        description: 'Add tools to {workspace}/tools/ (Phase 2)',
      },
    };

    const msg = messages[source];

    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="p-2 rounded-full bg-muted mb-2">
          <WrenchIcon />
        </div>
        <h3 className="text-xs font-medium text-foreground mb-0.5">{msg.title}</h3>
        <p className="text-xs text-muted-foreground">{msg.description}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 h-full">
      <div className="max-w-3xl mx-auto space-y-4 pb-48">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <WrenchIcon />
          </div>
          <h1 className="text-base font-semibold text-foreground">Tools</h1>
          <IconButton
            icon={<RefreshIcon />}
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className={cn(
              'ml-auto text-muted-foreground hover:text-foreground',
              refreshing && 'animate-spin hover:bg-transparent'
            )}
            title="Refresh tools"
          />
        </div>

        {/* Tabs */}
        <ToggleGroup value={activeTab} onChange={setActiveTab} options={TAB_OPTIONS} columns={4} />

        {/* Tool List */}
        <div className="space-y-1">
          {hasToolsForTab(activeTab)
            ? filteredTools.map((tool) => (
                <ToolCard
                  key={tool.name}
                  name={tool.name}
                  description={tool.description}
                  source={tool.source}
                  status={tool.status}
                  enabled={enabledTools.has(tool.name)}
                  onToggle={(enabled) => void handleToggle(tool.name, enabled)}
                />
              ))
            : renderEmptyState(activeTab)}
        </div>

        {/* Footer */}
        <div className="text-xs text-muted-foreground text-center">
          {totalCount} {totalCount === 1 ? 'tool' : 'tools'} • {enabledCount} enabled
        </div>
      </div>
    </div>
  );
};
