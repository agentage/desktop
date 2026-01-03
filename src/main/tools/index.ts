import { builtinTools } from './definitions.js';
import { handler as fetchUrl } from './handlers/fetch-url.js';
import { handler as runShell } from './handlers/run-shell.js';
import { handler as searchGithub } from './handlers/search-github.js';
import { handler as webSearch } from './handlers/web-search.js';
import type { Tool, ToolContext, ToolHandler } from './types.js';

/**
 * Default timeout for tool execution (60 seconds)
 */
const DEFAULT_TOOL_TIMEOUT = 60000;

/**
 * Registry of builtin tool handlers by name
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers: Record<string, ToolHandler<any, any>> = {
  search_github: searchGithub,
  fetch_url: fetchUrl,
  run_shell: runShell,
  web_search: webSearch,
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
 * Includes timeout protection to prevent hanging
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

  // Create timeout race to prevent hanging tools
  const timeoutMs = DEFAULT_TOOL_TIMEOUT;
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Tool "${name}" timed out after ${String(timeoutMs)}ms`));
    }, timeoutMs);

    // Clean up timeout if aborted
    context?.abortSignal?.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      reject(new Error(`Tool "${name}" was cancelled`));
    });
  });

  // Race between handler execution and timeout
  return Promise.race([handler(input, context), timeoutPromise]);
};

// Re-export types for convenience
export type { Tool, ToolContext, ToolDefinition, ToolHandler, ToolResult } from './types.js';
