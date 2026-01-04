import { BrainIcon, FileTextIcon, LinkIcon, Tabs, TabsContent, TabsList, TabsTrigger, WrenchIcon } from '../components/index.js';
import { ConnectionsPage } from './auth/ConnectionsPage.js';
import { ContextPage } from './ContextPage.js';
import { ModelsPage } from './ModelsPage.js';
import { ToolsPage } from './tools/ToolsPage.js';

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
export const ResourcesPage = (): React.JSX.Element => (
  <Tabs defaultValue="models" className="flex flex-col h-full">
    {/* Tab Navigation */}
    <div className="border-b border-border px-4 pt-4">
      <TabsList>
        <TabsTrigger value="models">
          <BrainIcon />
          <span>Models</span>
        </TabsTrigger>
        <TabsTrigger value="tools">
          <WrenchIcon />
          <span>Tools</span>
        </TabsTrigger>
        <TabsTrigger value="connections">
          <LinkIcon />
          <span>Connections</span>
        </TabsTrigger>
        <TabsTrigger value="context">
          <FileTextIcon />
          <span>Context</span>
        </TabsTrigger>
      </TabsList>
    </div>

    {/* Tab Content */}
    <TabsContent value="models" className="flex-1 overflow-y-auto">
      <ModelsPage />
    </TabsContent>
    <TabsContent value="tools" className="flex-1 overflow-y-auto">
      <ToolsPage />
    </TabsContent>
    <TabsContent value="connections" className="flex-1 overflow-y-auto">
      <ConnectionsPage />
    </TabsContent>
    <TabsContent value="context" className="flex-1 overflow-y-auto">
      <ContextPage />
    </TabsContent>
  </Tabs>
);
