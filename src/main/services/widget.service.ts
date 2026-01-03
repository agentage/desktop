import { mkdir, readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import type { Layout, LayoutConfig, WidgetsConfig } from '../../shared/types/widget.types.js';

const AGENTAGE_DIR = join(homedir(), '.agentage');
const GLOBAL_WIDGETS_PATH = join(AGENTAGE_DIR, 'widgets.json');
const GLOBAL_LAYOUT_PATH = join(AGENTAGE_DIR, 'layout.json');

/**
 * Get project-specific widgets.json path
 */
const getProjectWidgetsPath = (projectPath: string): string =>
  join(projectPath, '.agentage', 'widgets.json');

/**
 * Get project-specific layout.json path
 */
const getProjectLayoutPath = (projectPath: string): string =>
  join(projectPath, '.agentage', 'layout.json');

/**
 * Default widgets configuration
 */
const DEFAULT_WIDGETS_CONFIG: WidgetsConfig = {
  version: '1.0',
  widgets: {
    'agent-stats': { enabled: true },
    'tools-stats': { enabled: true },
    'models-stats': { enabled: true },
    'connections-stats': { enabled: true },
  },
};

/**
 * Default layout configuration
 */
const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  version: '1.0',
  layouts: {
    home: {
      name: 'Dashboard',
      grid: { columns: 4, rowHeight: 120 },
      widgets: [
        { id: 'agent-stats', position: { x: 0, y: 0 }, size: { w: 2, h: 1 } },
        { id: 'tools-stats', position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
        { id: 'models-stats', position: { x: 0, y: 1 }, size: { w: 2, h: 1 } },
        { id: 'connections-stats', position: { x: 2, y: 1 }, size: { w: 2, h: 1 } },
      ],
    },
  },
};

/**
 * Ensure default config files exist
 */
export const ensureDefaultConfigs = async (): Promise<void> => {
  await mkdir(AGENTAGE_DIR, { recursive: true });

  // Create default widgets.json if not exists
  try {
    await readFile(GLOBAL_WIDGETS_PATH, 'utf-8');
  } catch {
    await writeFile(GLOBAL_WIDGETS_PATH, JSON.stringify(DEFAULT_WIDGETS_CONFIG, null, 2), 'utf-8');
  }

  // Create default layout.json if not exists
  try {
    await readFile(GLOBAL_LAYOUT_PATH, 'utf-8');
  } catch {
    await writeFile(GLOBAL_LAYOUT_PATH, JSON.stringify(DEFAULT_LAYOUT_CONFIG, null, 2), 'utf-8');
  }
};

/**
 * Load enabled widgets by merging global and project configs
 * Project config overrides global config
 */
export const loadEnabledWidgets = async (projectPath?: string): Promise<Set<string>> => {
  const enabled = new Set<string>();

  // Load global widgets
  try {
    const content = await readFile(GLOBAL_WIDGETS_PATH, 'utf-8');
    const config = JSON.parse(content) as WidgetsConfig;
    for (const [id, entry] of Object.entries(config.widgets)) {
      if (entry.enabled) enabled.add(id);
    }
  } catch {
    // Use defaults if global config doesn't exist
    for (const [id, entry] of Object.entries(DEFAULT_WIDGETS_CONFIG.widgets)) {
      if (entry.enabled) enabled.add(id);
    }
  }

  // Load project overrides
  if (projectPath) {
    try {
      const content = await readFile(getProjectWidgetsPath(projectPath), 'utf-8');
      const config = JSON.parse(content) as WidgetsConfig;
      for (const [id, entry] of Object.entries(config.widgets)) {
        if (entry.enabled) {
          enabled.add(id);
        } else {
          enabled.delete(id);
        }
      }
    } catch {
      // No project config, use global only
    }
  }

  return enabled;
};

/**
 * Load layout by ID, checking project first then global
 */
export const loadLayoutById = async (
  layoutId: string,
  projectPath?: string
): Promise<Layout | null> => {
  // Try project layout first
  if (projectPath) {
    try {
      const content = await readFile(getProjectLayoutPath(projectPath), 'utf-8');
      const config = JSON.parse(content) as LayoutConfig;
      const layout = config.layouts[layoutId] as Layout | undefined;
      if (layout) return layout;
    } catch {
      // Fall through to global
    }
  }

  // Try global layout
  try {
    const content = await readFile(GLOBAL_LAYOUT_PATH, 'utf-8');
    const config = JSON.parse(content) as LayoutConfig;
    const layout = config.layouts[layoutId] as Layout | undefined;
    if (layout) return layout;
  } catch {
    // Fall back to default
  }

  // Return default layout if available
  return DEFAULT_LAYOUT_CONFIG.layouts[layoutId] ?? null;
};

/**
 * Load layout with only enabled widgets filtered
 */
export const loadLayout = async (
  layoutId: string,
  projectPath?: string
): Promise<{ layout: Layout } | null> => {
  // Ensure default configs exist
  await ensureDefaultConfigs();

  // Load enabled widgets
  const enabledWidgets = await loadEnabledWidgets(projectPath);

  // Load layout
  const layout = await loadLayoutById(layoutId, projectPath);
  if (!layout) return null;

  // Filter widgets to only include enabled ones
  const filteredWidgets = layout.widgets.filter((w) => enabledWidgets.has(w.id));

  return {
    layout: { ...layout, widgets: filteredWidgets },
  };
};
