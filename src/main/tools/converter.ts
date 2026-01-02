import type Anthropic from '@anthropic-ai/sdk';
import type { ToolDefinition } from './types.js';

/**
 * Convert internal tool definition to Anthropic tool format
 * Maps our JSONSchema7 inputSchema to Anthropic's Tool.InputSchema
 */
export const toAnthropicTool = (tool: ToolDefinition): Anthropic.Tool => ({
  name: tool.name,
  description: tool.description,
  input_schema: tool.inputSchema as Anthropic.Tool.InputSchema,
});

/**
 * Convert multiple tools to Anthropic format
 */
export const toAnthropicTools = (tools: ToolDefinition[]): Anthropic.Tool[] =>
  tools.map(toAnthropicTool);
