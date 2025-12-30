import type { IpcMain } from 'electron';
import {
  addWorkspace,
  browseWorkspaceFolder,
  ensureDefaultWorkspace,
  getActiveWorkspace,
  listWorkspaces,
  removeWorkspace,
  renameWorkspace,
  switchWorkspace,
} from '../services/workspace.service.js';

export const registerWorkspaceHandlers = (ipcMain: IpcMain): void => {
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
};
