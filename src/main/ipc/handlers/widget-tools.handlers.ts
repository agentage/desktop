import type { IpcMain } from 'electron';
import type { ToolDefinition } from '../../../shared/types/widget.types.js';
import { listAgents } from '../../services/agent.service.js';

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
