import type { BrowserWindow, IpcMain } from 'electron';
import type { WorkspaceUpdate } from '../../../shared/types/workspace.types.js';
import {
  addWorkspace,
  browseWorkspaceFolder,
  getActiveWorkspace,
  listWorkspaces,
  removeWorkspace,
  saveWorkspace,
  setMainWindow,
  switchWorkspace,
  updateWorkspace,
} from '../../services/workspace.service.js';

export const registerWorkspaceHandlers = (
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null
): void => {
  // Set up main window reference for events
  const updateMainWindow = (): void => {
    setMainWindow(getMainWindow());
  };

  // Update window reference periodically (in case it changes)
  setInterval(updateMainWindow, 1000);
  updateMainWindow();

  ipcMain.handle('workspace:list', async () => listWorkspaces());

  ipcMain.handle('workspace:getActive', async () => getActiveWorkspace());

  ipcMain.handle('workspace:add', async (_event, path: string) => addWorkspace(path));

  ipcMain.handle('workspace:remove', async (_event, id: string) => {
    await removeWorkspace(id);
  });

  ipcMain.handle('workspace:switch', async (_event, id: string) => {
    await switchWorkspace(id);
  });

  ipcMain.handle('workspace:update', async (_event, id: string, updates: WorkspaceUpdate) => {
    await updateWorkspace(id, updates);
  });

  ipcMain.handle('workspace:browse', async () => browseWorkspaceFolder());

  ipcMain.handle('workspace:save', async (_event, id: string, message?: string) => {
    await saveWorkspace(id, message);
  });
};
