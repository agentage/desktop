import type { IpcMain } from 'electron';
import type { ToolDefinition } from '../../../shared/types/widget.types.js';
import { listAgents } from '../../services/agent.service.js';
import { getLinkedProviders } from '../../services/auth.service.js';
import { getModels } from '../../services/chat.service.js';
import { listTools } from '../../tools/index.js';

// Tool handler registry
type ToolHandler = (params: unknown) => Promise<unknown>;
const toolHandlers = new Map<string, ToolHandler>();

// Tool definitions registry
const toolDefinitions: ToolDefinition[] = [];

/**
 * Register a tool handler with its definition
 */
const registerTool = (definition: ToolDefinition, handler: ToolHandler): void => {
  toolHandlers.set(definition.name, handler);
  toolDefinitions.push(definition);
};

/**
 * Initialize built-in tool handlers
 */
const initializeBuiltinTools = (): void => {
  // agents:count tool
  registerTool(
    {
      name: 'agents:count',
      description: 'Get the count of available agents',
      inputSchema: { type: 'object', properties: {} },
    },
    async () => {
      const agents = await listAgents();
      return { count: agents.length };
    }
  );

  // tools:count tool
  registerTool(
    {
      name: 'tools:count',
      description: 'Get the count of available tools',
      inputSchema: { type: 'object', properties: {} },
    },
    async () => {
      const tools = listTools();
      return { count: tools.length };
    }
  );

  // models:count tool
  registerTool(
    {
      name: 'models:count',
      description: 'Get the count of available AI models',
      inputSchema: { type: 'object', properties: {} },
    },
    async () => {
      const models = await getModels();
      return { count: models.length };
    }
  );

  // connections:count tool
  registerTool(
    {
      name: 'connections:count',
      description: 'Get the count of active connections',
      inputSchema: { type: 'object', properties: {} },
    },
    async () => {
      const providers = await getLinkedProviders();
      return { count: providers.length };
    }
  );
};

// Initialize tools on module load
initializeBuiltinTools();

export const registerWidgetToolHandlers = (ipcMain: IpcMain): void => {
  ipcMain.handle(
    'widgets:callTool',
    async (_event, toolName: string, params: unknown): Promise<unknown> => {
      const handler = toolHandlers.get(toolName);
      if (!handler) {
        const available = Array.from(toolHandlers.keys()).join(', ');
        throw new Error(`Unknown tool: ${toolName}. Available tools: ${available}`);
      }
      return handler(params);
    }
  );

  ipcMain.handle('widgets:listTools', (): ToolDefinition[] => toolDefinitions);
};
