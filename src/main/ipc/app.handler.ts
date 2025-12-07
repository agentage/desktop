import type { IpcMain } from 'electron';
import { app, shell } from 'electron';

export const registerAppHandlers = (ipcMain: IpcMain): void => {
  ipcMain.handle('app:version', () => app.getVersion());

  ipcMain.handle('app:openExternal', (_event, url: string) => shell.openExternal(url));

  ipcMain.on('app:quit', () => {
    app.quit();
  });
};
