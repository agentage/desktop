import type { ToolDefinition } from '../../../shared/types/widget.types.js';

export const tools: ToolDefinition[] = [
  {
    name: 'agents:count',
    description: 'Get agent count',
    inputSchema: { type: 'object', properties: {} },
  },
];
