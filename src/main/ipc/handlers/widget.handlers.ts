import type { IpcMain } from 'electron';
import type { WidgetPlacement } from '../../../shared/types/widget.types.js';
import { loadLayout, saveLayout } from '../../services/widget.service.js';
import { getActiveWorkspace } from '../../services/workspace.service.js';

export const registerWidgetHandlers = (ipcMain: IpcMain): void => {
  ipcMain.handle('widgets:loadLayout', async (_event, layoutId: string) => {
    // Get active workspace for project-specific config
    const workspace = await getActiveWorkspace();
    const projectPath = workspace?.path;

    return loadLayout(layoutId, projectPath);
  });

  ipcMain.handle(
    'widgets:saveLayout',
    async (_event, layoutId: string, widgets: WidgetPlacement[]) => {
      // Get active workspace for project-specific config
      const workspace = await getActiveWorkspace();
      const projectPath = workspace?.path;

      return saveLayout(layoutId, widgets, projectPath);
    }
  );
};
