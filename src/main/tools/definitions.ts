import type { ToolDefinition } from './types.js';

/**
 * Built-in tool definitions (Phase 1)
 * These are compiled with the app and always available
 */
export const builtinTools: ToolDefinition[] = [
  {
    name: 'search_github',
    description: 'Search GitHub repositories by query',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', description: 'Maximum results to return', default: 10 },
      },
      required: ['query'],
    },
  },
  {
    name: 'fetch_url',
    description: 'Fetch content from a URL',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to fetch' },
      },
      required: ['url'],
    },
  },
  {
    name: 'run_shell',
    description: 'Execute a shell command',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Shell command to run' },
        timeout: { type: 'number', description: 'Timeout in milliseconds', default: 30000 },
      },
      required: ['command'],
    },
  },
];
