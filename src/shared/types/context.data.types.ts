/**
 * Context data types for system prompt management
 */

/**
 * Context data structure
 */
export interface ContextData {
  systemPrompt: string;
}

/**
 * Context data API exposed via preload
 */
export interface ContextDataAPI {
  /** Load context data */
  load: () => Promise<ContextData>;
  /** Save context data */
  save: (data: ContextData) => Promise<void>;
}
