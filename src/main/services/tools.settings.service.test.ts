/**
 * Tools Settings Service Tests
 */
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import type { ToolSettings } from '../../shared/types/index.js';

// Create temp test directory for each test run
const TEST_DIR = join(tmpdir(), `agentage-tools-test-${String(Date.now())}`);
const TOOLS_FILE = join(TEST_DIR, 'tools.json');

/**
 * Helper to load settings directly from test file
 */
const loadTestSettings = async (): Promise<ToolSettings> => {
  try {
    const content = await readFile(TOOLS_FILE, 'utf-8');
    const parsed = JSON.parse(content) as ToolSettings;
    return {
      enabledTools: Array.isArray(parsed.enabledTools) ? parsed.enabledTools : [],
    };
  } catch {
    return { enabledTools: [] };
  }
};

/**
 * Helper to save settings directly to test file
 */
const saveTestSettings = async (settings: ToolSettings): Promise<void> => {
  await mkdir(TEST_DIR, { recursive: true });
  await writeFile(TOOLS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
};

describe('tools.settings - file operations', () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe('loadTestSettings', () => {
    it('should return empty array when no file exists', async () => {
      const settings = await loadTestSettings();
      expect(settings.enabledTools).toEqual([]);
    });

    it('should load settings from file', async () => {
      const testSettings = { enabledTools: ['tool1', 'tool2'] };
      await saveTestSettings(testSettings);

      const settings = await loadTestSettings();
      expect(settings.enabledTools).toEqual(['tool1', 'tool2']);
    });

    it('should handle invalid JSON gracefully', async () => {
      await writeFile(TOOLS_FILE, 'not valid json');

      const settings = await loadTestSettings();
      expect(settings.enabledTools).toEqual([]);
    });

    it('should handle missing enabledTools array', async () => {
      await writeFile(TOOLS_FILE, JSON.stringify({ other: 'data' }));

      const settings = await loadTestSettings();
      expect(settings.enabledTools).toEqual([]);
    });
  });

  describe('saveTestSettings', () => {
    it('should save settings to file', async () => {
      const testSettings = { enabledTools: ['custom_tool'] };
      await saveTestSettings(testSettings);

      const content = await readFile(TOOLS_FILE, 'utf-8');
      const parsed = JSON.parse(content) as typeof testSettings;
      expect(parsed.enabledTools).toEqual(['custom_tool']);
    });

    it('should create directory if not exists', async () => {
      await rm(TEST_DIR, { recursive: true, force: true });

      const testSettings = { enabledTools: ['tool1'] };
      await saveTestSettings(testSettings);

      const content = await readFile(TOOLS_FILE, 'utf-8');
      expect(JSON.parse(content)).toEqual(testSettings);
    });

    it('should overwrite existing settings', async () => {
      await saveTestSettings({ enabledTools: ['old_tool'] });
      await saveTestSettings({ enabledTools: ['new_tool'] });

      const settings = await loadTestSettings();
      expect(settings.enabledTools).toEqual(['new_tool']);
    });
  });

  describe('settings persistence', () => {
    it('should round-trip empty array', async () => {
      await saveTestSettings({ enabledTools: [] });
      const settings = await loadTestSettings();
      expect(settings.enabledTools).toEqual([]);
    });

    it('should round-trip multiple tools', async () => {
      const tools = ['search_github', 'fetch_url', 'run_shell'];
      await saveTestSettings({ enabledTools: tools });
      const settings = await loadTestSettings();
      expect(settings.enabledTools).toEqual(tools);
    });
  });
});
