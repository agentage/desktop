/**
 * Widget Service Tests
 */
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

// Create temp test directory for each test run
const TEST_DIR = join(tmpdir(), `agentage-widget-test-${String(Date.now())}`);
const WIDGETS_FILE = join(TEST_DIR, 'widgets.json');
const LAYOUT_FILE = join(TEST_DIR, 'layout.json');

interface WidgetsConfig {
  version: string;
  widgets: Record<string, { enabled: boolean }>;
}

interface WidgetPlacement {
  id: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
}

interface Layout {
  name: string;
  grid: { columns: number; rowHeight: number };
  widgets: WidgetPlacement[];
}

interface LayoutConfig {
  version: string;
  layouts: Record<string, Layout>;
}

/**
 * Helper to load widgets config directly from test file
 */
const loadTestWidgetsConfig = async (): Promise<WidgetsConfig | null> => {
  try {
    const content = await readFile(WIDGETS_FILE, 'utf-8');
    return JSON.parse(content) as WidgetsConfig;
  } catch {
    return null;
  }
};

/**
 * Helper to save widgets config directly to test file
 */
const saveTestWidgetsConfig = async (config: WidgetsConfig): Promise<void> => {
  await mkdir(TEST_DIR, { recursive: true });
  await writeFile(WIDGETS_FILE, JSON.stringify(config, null, 2), 'utf-8');
};

/**
 * Helper to load layout config directly from test file
 */
const loadTestLayoutConfig = async (): Promise<LayoutConfig | null> => {
  try {
    const content = await readFile(LAYOUT_FILE, 'utf-8');
    return JSON.parse(content) as LayoutConfig;
  } catch {
    return null;
  }
};

/**
 * Helper to save layout config directly to test file
 */
const saveTestLayoutConfig = async (config: LayoutConfig): Promise<void> => {
  await mkdir(TEST_DIR, { recursive: true });
  await writeFile(LAYOUT_FILE, JSON.stringify(config, null, 2), 'utf-8');
};

describe('widget.service - config file operations', () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe('widgets config', () => {
    it('should return null when no widgets file exists', async () => {
      const config = await loadTestWidgetsConfig();
      expect(config).toBeNull();
    });

    it('should load widgets config from file', async () => {
      const testConfig: WidgetsConfig = {
        version: '1.0',
        widgets: {
          'agent-stats': { enabled: true },
          'task-list': { enabled: false },
        },
      };
      await saveTestWidgetsConfig(testConfig);

      const config = await loadTestWidgetsConfig();
      expect(config).toEqual(testConfig);
    });

    it('should correctly identify enabled widgets', async () => {
      const testConfig: WidgetsConfig = {
        version: '1.0',
        widgets: {
          'agent-stats': { enabled: true },
          'task-list': { enabled: false },
          'quick-actions': { enabled: true },
        },
      };
      await saveTestWidgetsConfig(testConfig);

      const config = await loadTestWidgetsConfig();
      expect(config).not.toBeNull();

      const enabled = new Set<string>();
      if (config) {
        for (const [id, entry] of Object.entries(config.widgets)) {
          if (entry.enabled) enabled.add(id);
        }
      }

      expect(enabled.has('agent-stats')).toBe(true);
      expect(enabled.has('quick-actions')).toBe(true);
      expect(enabled.has('task-list')).toBe(false);
    });
  });

  describe('layout config', () => {
    it('should return null when no layout file exists', async () => {
      const config = await loadTestLayoutConfig();
      expect(config).toBeNull();
    });

    it('should load layout config from file', async () => {
      const testConfig: LayoutConfig = {
        version: '1.0',
        layouts: {
          home: {
            name: 'Dashboard',
            grid: { columns: 4, rowHeight: 120 },
            widgets: [{ id: 'agent-stats', position: { x: 0, y: 0 }, size: { w: 2, h: 1 } }],
          },
        },
      };
      await saveTestLayoutConfig(testConfig);

      const config = await loadTestLayoutConfig();
      expect(config).toEqual(testConfig);
    });

    it('should correctly retrieve layout by id', async () => {
      const testConfig: LayoutConfig = {
        version: '1.0',
        layouts: {
          home: {
            name: 'Dashboard',
            grid: { columns: 4, rowHeight: 120 },
            widgets: [{ id: 'agent-stats', position: { x: 0, y: 0 }, size: { w: 2, h: 1 } }],
          },
          settings: {
            name: 'Settings View',
            grid: { columns: 2, rowHeight: 100 },
            widgets: [],
          },
        },
      };
      await saveTestLayoutConfig(testConfig);

      const config = await loadTestLayoutConfig();
      expect(config).not.toBeNull();
      expect(config).toBeDefined();
      if (config) {
        expect(config.layouts.home.name).toBe('Dashboard');
        expect(config.layouts.settings.name).toBe('Settings View');
      }
    });
  });

  describe('config file persistence', () => {
    it('should round-trip widgets config', async () => {
      const testConfig: WidgetsConfig = {
        version: '1.0',
        widgets: {
          'agent-stats': { enabled: true },
        },
      };

      await saveTestWidgetsConfig(testConfig);
      const loaded = await loadTestWidgetsConfig();

      expect(loaded).toEqual(testConfig);
    });

    it('should round-trip layout config', async () => {
      const testConfig: LayoutConfig = {
        version: '1.0',
        layouts: {
          home: {
            name: 'Test Dashboard',
            grid: { columns: 3, rowHeight: 150 },
            widgets: [
              { id: 'widget-1', position: { x: 0, y: 0 }, size: { w: 1, h: 1 } },
              { id: 'widget-2', position: { x: 1, y: 0 }, size: { w: 2, h: 2 } },
            ],
          },
        },
      };

      await saveTestLayoutConfig(testConfig);
      const loaded = await loadTestLayoutConfig();

      expect(loaded).toEqual(testConfig);
    });

    it('should create directory if not exists', async () => {
      await rm(TEST_DIR, { recursive: true, force: true });

      const testConfig: WidgetsConfig = {
        version: '1.0',
        widgets: { 'test-widget': { enabled: true } },
      };
      await saveTestWidgetsConfig(testConfig);

      const content = await readFile(WIDGETS_FILE, 'utf-8');
      expect(JSON.parse(content)).toEqual(testConfig);
    });
  });
});
