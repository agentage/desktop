import { readFile, stat } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import type {
  ContextBreakdownData,
  ContextFileInfo,
  ContextItem,
  FilesOnlyResponse,
  FullContextResponse,
} from '../../shared/types/context.types.js';

// Default paths
const GLOBAL_CONTEXT_PATH = join(homedir(), '.agentage', 'AGENTAGE.md');

// Context colors matching UI
const CONTEXT_COLORS = {
  systemPrompt: '#3B82F6',
  systemTools: '#EAB308',
  agentageFiles: '#22C55E',
  mcpTools: '#F97316',
  conversation: '#06B6D4',
} as const;

// Current project path (set when workspace is opened)
let currentProjectPath: string | null = null;

/**
 * Set the current project path for context file resolution
 */
export const setProjectPath = (path: string | null): void => {
  currentProjectPath = path;
};

/**
 * Get the current project path
 */
export const getProjectPath = (): string | null => currentProjectPath;

/**
 * Estimate token count from text content
 * Uses ~4 chars per token as rough estimate (fallback)
 */
const estimateTokens = (content: string): number =>
  // Simple estimation: ~4 characters per token for English text
  Math.ceil(content.length / 4);
/**
 * Read context file and get info
 */
const readContextFile = async (filePath: string): Promise<ContextFileInfo> => {
  try {
    const [content, stats] = await Promise.all([readFile(filePath, 'utf-8'), stat(filePath)]);

    return {
      path: filePath,
      exists: true,
      tokens: estimateTokens(content),
      lastModified: stats.mtime.toISOString(),
      content,
    };
  } catch {
    return {
      path: filePath,
      exists: false,
      tokens: 0,
      lastModified: null,
    };
  }
};

/**
 * Get project context file path
 */
const getProjectContextPath = (): string | null => {
  if (!currentProjectPath) return null;
  return join(currentProjectPath, 'AGENTAGE.md');
};

/**
 * Get context files info (global + project)
 */
export const getContextFiles = async (): Promise<{
  global: ContextFileInfo;
  project: ContextFileInfo | null;
}> => {
  const globalInfo = await readContextFile(GLOBAL_CONTEXT_PATH);

  const projectPath = getProjectContextPath();
  const projectInfo = projectPath ? await readContextFile(projectPath) : null;

  return {
    global: globalInfo,
    project: projectInfo,
  };
};

/**
 * Build context breakdown data for a conversation
 */
const buildBreakdown = (
  files: { global: ContextFileInfo; project: ContextFileInfo | null },
  conversationTokens: number,
  systemPromptTokens: number,
  systemToolsTokens: number,
  mcpToolsTokens: number
): ContextBreakdownData => {
  const agentageTokens = files.global.tokens + (files.project?.tokens ?? 0);

  const totalTokens =
    systemPromptTokens + systemToolsTokens + agentageTokens + mcpToolsTokens + conversationTokens;

  const maxContext = 200000; // Claude's context window

  const calculatePercentage = (tokens: number): number =>
    totalTokens > 0 ? Math.round((tokens / totalTokens) * 100) : 0;

  const items: ContextItem[] = [
    {
      name: 'System Prompt',
      tokens: systemPromptTokens,
      percentage: calculatePercentage(systemPromptTokens),
      color: CONTEXT_COLORS.systemPrompt,
    },
    {
      name: 'System Tools',
      tokens: systemToolsTokens,
      percentage: calculatePercentage(systemToolsTokens),
      color: CONTEXT_COLORS.systemTools,
    },
    {
      name: 'AGENTAGE.md',
      tokens: agentageTokens,
      percentage: calculatePercentage(agentageTokens),
      color: CONTEXT_COLORS.agentageFiles,
    },
    {
      name: 'MCP Tools',
      tokens: mcpToolsTokens,
      percentage: calculatePercentage(mcpToolsTokens),
      color: CONTEXT_COLORS.mcpTools,
    },
    {
      name: 'Conversation',
      tokens: conversationTokens,
      percentage: calculatePercentage(conversationTokens),
      color: CONTEXT_COLORS.conversation,
    },
  ];

  const agentageFiles: { path: string; tokens: number }[] = [];

  if (files.global.exists) {
    agentageFiles.push({
      path: files.global.path.replace(homedir(), '~'),
      tokens: files.global.tokens,
    });
  }

  if (files.project?.exists) {
    agentageFiles.push({
      path: files.project.path.replace(homedir(), '~'),
      tokens: files.project.tokens,
    });
  }

  return {
    currentContext: totalTokens,
    maxContext,
    items,
    agentageFiles,
    timestamp: new Date().toLocaleTimeString(),
  };
};

/**
 * Get context info - with or without thread
 */
export const getContextInfo = async (
  threadId?: string,
  conversationTokens = 0,
  systemPromptTokens = 0,
  systemToolsTokens = 0,
  mcpToolsTokens = 0
): Promise<FullContextResponse | FilesOnlyResponse> => {
  const files = await getContextFiles();

  if (!threadId) {
    // Return files only (no conversation breakdown)
    return { files };
  }

  // Return full breakdown with conversation data
  const breakdown = buildBreakdown(
    files,
    conversationTokens,
    systemPromptTokens,
    systemToolsTokens,
    mcpToolsTokens
  );

  return {
    threadId,
    breakdown,
    files,
  };
};

/**
 * Get combined content from all AGENTAGE.md files for system prompt
 */
export const getAgentageContent = async (): Promise<string> => {
  const files = await getContextFiles();
  const parts: string[] = [];

  if (files.global.exists && files.global.content) {
    parts.push(`# Global Context (${files.global.path})\n\n${files.global.content}`);
  }

  if (files.project?.exists && files.project.content) {
    parts.push(`# Project Context (${files.project.path})\n\n${files.project.content}`);
  }

  return parts.join('\n\n---\n\n');
};
