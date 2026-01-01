import { builtinTools } from './definitions.js';
import { handler as fetchUrl } from './handlers/fetch-url.js';
import { handler as runShell } from './handlers/run-shell.js';
import { handler as searchGithub } from './handlers/search-github.js';
import type { Tool, ToolContext, ToolHandler } from './types.js';

/**
 * Registry of builtin tool handlers by name
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers: Record<string, ToolHandler<any, any>> = {
  search_github: searchGithub,
  fetch_url: fetchUrl,
  run_shell: runShell,
};

/**
 * List all available tools
 * Phase 1: Returns only builtin tools
 * Phase 2: Will merge builtin + global + workspace tools
 */
export const listTools = (): Tool[] =>
  builtinTools.map((t) => ({
    ...t,
    source: 'builtin' as const,
  }));

/**
 * Get a single tool by name
 */
export const getTool = (name: string): Tool | null => {
  const def = builtinTools.find((t) => t.name === name);
  return def ? { ...def, source: 'builtin' } : null;
};

/**
 * Execute a tool by name with given input
 */
export const executeTool = async (
  name: string,
  input: Record<string, unknown>,
  context?: ToolContext
): Promise<unknown> => {
  const handler = handlers[name] as ToolHandler<Record<string, unknown>> | undefined;

  if (!handler) {
    throw new Error(`Tool not found: ${name}`);
  }

  return handler(input, context);
};

// Re-export types for convenience
export type { Tool, ToolContext, ToolDefinition, ToolHandler, ToolResult } from './types.js';
