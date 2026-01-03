import type { IpcMain } from 'electron';
import { loadLayout } from '../../services/widget.service.js';
import { getActiveWorkspace } from '../../services/workspace.service.js';

export const registerWidgetHandlers = (ipcMain: IpcMain): void => {
  ipcMain.handle('widgets:loadLayout', async (_event, layoutId: string) => {
    // Get active workspace for project-specific config
    const workspace = await getActiveWorkspace();
    const projectPath = workspace?.path;

    return loadLayout(layoutId, projectPath);
  });
};
