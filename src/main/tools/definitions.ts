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
    description:
      'Fetch content from a URL and extract clean, readable text. Returns title, content, and metadata.',
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
  {
    name: 'web_search',
    description:
      'Search the web using DuckDuckGo. Returns a list of URLs with titles and snippets. Use this to discover URLs for research.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', description: 'Maximum results to return (max 20)', default: 10 },
        region: {
          type: 'string',
          description: 'Region code (e.g., us, uk, de). Default: worldwide',
        },
        timeRange: {
          type: 'string',
          enum: ['d', 'w', 'm', 'y'],
          description: 'Time range filter: d=day, w=week, m=month, y=year',
        },
      },
      required: ['query'],
    },
  },
];
