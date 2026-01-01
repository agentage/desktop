/**
 * Context types for chat context breakdown
 */

/**
 * Individual context item in breakdown
 */
export interface ContextItem {
  name: string;
  tokens: number;
  percentage: number;
  color: string;
}

/**
 * Context breakdown data for UI display
 */
export interface ContextBreakdownData {
  currentContext: number;
  maxContext: number;
  items: ContextItem[];
  agentageFiles?: { path: string; tokens: number }[];
  timestamp: string;
}

/**
 * Context file information
 */
export interface ContextFileInfo {
  path: string;
  exists: boolean;
  tokens: number;
  lastModified: string | null;
  content?: string;
}

/**
 * Full context response with conversation breakdown
 */
export interface FullContextResponse {
  threadId: string;
  breakdown: ContextBreakdownData;
  files: {
    global: ContextFileInfo;
    project: ContextFileInfo | null;
  };
}

/**
 * Files-only response (no thread)
 */
export interface FilesOnlyResponse {
  files: {
    global: ContextFileInfo;
    project: ContextFileInfo | null;
  };
}

/**
 * Context API exposed via preload
 */
export interface ContextAPI {
  /** Get context info, optionally for a specific thread */
  get: (threadId?: string) => Promise<FullContextResponse | FilesOnlyResponse>;
}
