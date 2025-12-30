import type { BrowserWindow, IpcMain } from 'electron';
import {
  addWorkspace,
  browseWorkspaceFolder,
  ensureDefaultWorkspace,
  getActiveWorkspace,
  getWorkspaceDiff,
  listWorkspaces,
  removeWorkspace,
  renameWorkspace,
  saveWorkspace,
  setMainWindow,
  switchWorkspace,
} from '../services/workspace.service.js';

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

  ipcMain.handle('workspace:rename', async (_event, id: string, name: string) => {
    await renameWorkspace(id, name);
  });

  ipcMain.handle('workspace:browse', async () => browseWorkspaceFolder());

  ipcMain.handle('workspace:ensureDefault', async () => {
    await ensureDefaultWorkspace();
  });

  ipcMain.handle('workspace:save', async (_event, id: string, message?: string) => {
    await saveWorkspace(id, message);
  });

  ipcMain.handle('workspace:getDiff', async (_event, id: string) => getWorkspaceDiff(id));
};
