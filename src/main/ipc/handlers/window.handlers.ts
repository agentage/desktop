import type { BrowserWindow, IpcMain } from 'electron';

export const registerWindowHandlers = (
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null
): void => {
  ipcMain.handle('window:minimize', () => {
    const win = getMainWindow();
    if (win) win.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    const win = getMainWindow();
    if (!win) return;
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    const win = getMainWindow();
    if (win) win.close();
  });

  ipcMain.handle('window:isMaximized', () => {
    const win = getMainWindow();
    return win?.isMaximized() ?? false;
  });

  ipcMain.handle('window:openDevTools', () => {
    const win = getMainWindow();
    if (win) {
      win.webContents.openDevTools();
    }
  });
};
