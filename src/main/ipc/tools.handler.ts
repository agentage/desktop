import type { BrowserWindow, IpcMain } from 'electron';
import type {
  ToolInfo,
  ToolListResult,
  ToolSettingsUpdate,
  ToolStatus,
} from '../../shared/types/index.js';
import { loadToolSettings, updateToolSettings } from '../services/tools.settings.service.js';
import { getActiveWorkspace } from '../services/workspace.service.js';
import { executeTool, listTools } from '../tools/index.js';

/**
 * Result from tool execution IPC
 */
interface ToolExecuteResult {
  success: boolean;
  result?: unknown;
  error?: string;
}

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

export const registerToolsHandlers = (
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null
): void => {
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
   * Emits tools:change event to all windows for real-time sync
   */
  ipcMain.handle(
    'tools:updateSettings',
    async (_event, update: ToolSettingsUpdate): Promise<void> => {
      await updateToolSettings(update);
      // Emit change event to all windows for real-time sync
      const mainWindow = getMainWindow();
      mainWindow?.webContents.send('tools:change', update.enabledTools);
    }
  );

  /**
   * Execute a tool directly (for testing/debugging)
   * Not used by chat - chat executes tools internally
   */
  ipcMain.handle(
    'tools:execute',
    async (_event, name: string, input: Record<string, unknown>): Promise<ToolExecuteResult> => {
      try {
        const workspace = await getActiveWorkspace();
        const result = await executeTool(name, input, {
          workspacePath: workspace?.path,
        });
        return { success: true, result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  );
};
