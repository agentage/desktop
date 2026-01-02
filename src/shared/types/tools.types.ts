/**
 * Tool source indicating where the tool is defined
 */
export type ToolSource = 'builtin' | 'global' | 'workspace';

/**
 * Tab filter options for the tools list
 */
export type TabFilter = 'all' | ToolSource;

/**
 * Tool status indicating health/readiness
 */
export type ToolStatus = 'ready' | 'warning' | 'error';

/**
 * Tool information displayed in the UI
 */
export interface ToolInfo {
  name: string;
  description: string;
  source: ToolSource;
  status: ToolStatus;
}

/**
 * Tool settings for enabled/disabled state
 */
export interface ToolSettings {
  enabledTools: string[];
}

/**
 * Result of listing tools
 */
export interface ToolListResult {
  tools: ToolInfo[];
  settings: ToolSettings;
}

/**
 * Request to update tool settings
 */
export interface ToolSettingsUpdate {
  enabledTools: string[];
}
