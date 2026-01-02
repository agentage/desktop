import type { JSONSchema7 } from 'json-schema';

/**
 * Tool definition metadata (without handler)
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONSchema7;
}

/**
 * Full tool with source information
 */
export interface Tool extends ToolDefinition {
  source: 'builtin' | 'global' | 'workspace';
  root?: string;
}

/**
 * Context passed to tool handlers during execution
 */
export interface ToolContext {
  workspacePath?: string;
  abortSignal?: AbortSignal;
}

/**
 * Tool handler function signature
 */
export type ToolHandler<TInput = unknown, TOutput = unknown> = (
  input: TInput,
  context?: ToolContext
) => Promise<TOutput>;

/**
 * Tool execution result
 */
export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
