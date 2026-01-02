import { mkdir, readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import type { ToolSettings, ToolSettingsUpdate } from '../../shared/types/index.js';

const CONFIG_DIR = join(homedir(), '.agentage');
const TOOLS_SETTINGS_FILE = join(CONFIG_DIR, 'tools.json');

/**
 * Default tool settings
 * Phase 1: Enable safe tools by default
 */
const DEFAULT_SETTINGS: ToolSettings = {
  enabledTools: ['search_github', 'fetch_url'],
};

/**
 * Load tool settings from disk
 */
export const loadToolSettings = async (): Promise<ToolSettings> => {
  try {
    const content = await readFile(TOOLS_SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(content) as ToolSettings;
    return {
      enabledTools: Array.isArray(parsed.enabledTools) ? parsed.enabledTools : [],
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

/**
 * Save tool settings to disk
 */
export const saveToolSettings = async (settings: ToolSettings): Promise<void> => {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(TOOLS_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
};

/**
 * Update tool settings (merge with existing)
 */
export const updateToolSettings = async (update: ToolSettingsUpdate): Promise<void> => {
  const settings: ToolSettings = {
    enabledTools: update.enabledTools,
  };
  await saveToolSettings(settings);
};
