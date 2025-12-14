import type { IpcMain } from 'electron';
import { app, shell } from 'electron';
import { getConfigDir } from '../services/config.service.js';

export const registerAppHandlers = (ipcMain: IpcMain): void => {
  ipcMain.handle('app:version', () => app.getVersion());

  ipcMain.handle('app:openExternal', (_event, url: string) => shell.openExternal(url));

  ipcMain.handle('app:openPath', (_event, path: string) => shell.openPath(path));

  ipcMain.handle('app:getConfigDir', () => getConfigDir());

  ipcMain.on('app:quit', () => {
    app.quit();
  });
};
