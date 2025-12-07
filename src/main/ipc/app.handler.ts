import type { IpcMain } from 'electron';
import { app } from 'electron';

export const registerAppHandlers = (ipcMain: IpcMain): void => {
  ipcMain.handle('app:version', () => app.getVersion());

  ipcMain.on('app:quit', () => {
    app.quit();
  });
};
