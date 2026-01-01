import type { IpcMain } from 'electron';
import { listTools } from '../tools/index.js';

export const registerToolsHandlers = (ipcMain: IpcMain): void => {
  /**
   * List all available tools
   * Returns merged list: builtin + global + workspace (workspace overrides by name)
   */
  ipcMain.handle('tools:list', () => listTools());
};
