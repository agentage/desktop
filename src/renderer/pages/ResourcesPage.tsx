import { useState } from 'react';
import { BrainIcon, FileTextIcon, LinkIcon, ToggleGroup, WrenchIcon } from '../components/index.js';
import type { ToggleOption } from '../components/toggle-group.js';
import { cn } from '../lib/utils.js';
import { ConnectionsPage } from './auth/ConnectionsPage.js';
import { ContextPage } from './ContextPage.js';
import { ModelsPage } from './ModelsPage.js';
import { ToolsPage } from './tools/ToolsPage.js';

type ResourceTab = 'models' | 'tools' | 'connections' | 'context';

/**
 * Tab options for resource types
 */
const TAB_OPTIONS: ToggleOption<ResourceTab>[] = [
  { value: 'models', label: 'Models', icon: <BrainIcon /> },
  { value: 'tools', label: 'Tools', icon: <WrenchIcon /> },
  { value: 'connections', label: 'Connections', icon: <LinkIcon /> },
  { value: 'context', label: 'Context', icon: <FileTextIcon /> },
];

/**
 * ResourcesPage - Consolidated resource management interface
 *
 * Purpose: Single page to manage all resources (models, tools, connections, context)
 * Features:
 *   - Tab navigation between resource types
 *   - Models: LLM provider configuration
 *   - Tools: Tool management and settings
 *   - Connections: OAuth provider connections
 *   - Context: Document collections for RAG
 *
 * Route: /resources
 */
export const ResourcesPage = (): React.JSX.Element => {
  const [activeTab, setActiveTab] = useState<ResourceTab>('models');

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="border-b border-border px-4 pt-4 pb-2">
        <ToggleGroup
          value={activeTab}
          onChange={setActiveTab}
          options={TAB_OPTIONS}
          columns={4}
          vertical
        />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn(activeTab !== 'models' && 'hidden')}>
          <ModelsPage />
        </div>
        <div className={cn(activeTab !== 'tools' && 'hidden')}>
          <ToolsPage />
        </div>
        <div className={cn(activeTab !== 'connections' && 'hidden')}>
          <ConnectionsPage />
        </div>
        <div className={cn(activeTab !== 'context' && 'hidden')}>
          <ContextPage />
        </div>
      </div>
    </div>
  );
};
