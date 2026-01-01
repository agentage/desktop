import type { IpcMain } from 'electron';
import type {
  ToolInfo,
  ToolListResult,
  ToolSettingsUpdate,
  ToolStatus,
} from '../../shared/types/index.js';
import { loadToolSettings, updateToolSettings } from '../services/tools.settings.service.js';
import { listTools } from '../tools/index.js';

/**
 * Map tool to UI-friendly format
 */
const mapToolToInfo = (tool: ReturnType<typeof listTools>[number]): ToolInfo => ({
  name: tool.name,
  description: tool.description,
  source: tool.source,
  // Phase 1: All builtin tools are ready by default
  // Phase 2: Check tool health/availability
  status: 'ready' as ToolStatus,
});

export const registerToolsHandlers = (ipcMain: IpcMain): void => {
  /**
   * List all available tools with their settings
   * Returns merged list: builtin + global + workspace (workspace overrides by name)
   */
  ipcMain.handle('tools:list', async (): Promise<ToolListResult> => {
    const tools = listTools();
    const settings = await loadToolSettings();

    return {
      tools: tools.map(mapToolToInfo),
      settings,
    };
  });

  /**
   * Update tool settings (enabled/disabled state)
   */
  ipcMain.handle(
    'tools:updateSettings',
    async (_event, update: ToolSettingsUpdate): Promise<void> => {
      await updateToolSettings(update);
    }
  );
};
