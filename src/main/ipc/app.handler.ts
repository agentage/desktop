import type { BrowserWindow, IpcMain } from 'electron';
import { app, shell } from 'electron';
import { getConfigDir } from '../services/config.service.js';

// Track renderer ready state per window
const rendererReadyWindows = new WeakSet<BrowserWindow>();

// Timeout for renderer to signal ready (ms)
const RENDERER_READY_TIMEOUT = 3000;
// Max reload attempts before giving up
const MAX_RELOAD_ATTEMPTS = 3;

// Track reload attempts per window
const reloadAttempts = new WeakMap<BrowserWindow, number>();

/**
 * Setup auto-reload monitoring for a window
 * If renderer doesn't signal ready within timeout, reload the page
 */
export const setupRendererReadyMonitor = (win: BrowserWindow): void => {
  const checkReady = (): void => {
    // If window was closed, stop monitoring
    if (win.isDestroyed()) return;

    // If renderer signaled ready, we're done
    if (rendererReadyWindows.has(win)) {
      reloadAttempts.delete(win);
      return;
    }

    const attempts = reloadAttempts.get(win) ?? 0;

    if (attempts < MAX_RELOAD_ATTEMPTS) {
      console.warn(
        `Renderer not ready after ${String(RENDERER_READY_TIMEOUT)}ms, reloading (attempt ${String(attempts + 1)}/${String(MAX_RELOAD_ATTEMPTS)})...`
      );
      reloadAttempts.set(win, attempts + 1);
      win.reload();

      // Schedule another check after reload
      setTimeout(checkReady, RENDERER_READY_TIMEOUT);
    } else {
      console.error(
        `Renderer failed to initialize after ${String(MAX_RELOAD_ATTEMPTS)} attempts. Please restart the app.`
      );
    }
  };

  // Start monitoring after timeout
  setTimeout(checkReady, RENDERER_READY_TIMEOUT);
};

export const registerAppHandlers = (
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null
): void => {
  ipcMain.handle('app:version', () => app.getVersion());

  // Renderer signals it's ready - mark as ready
  ipcMain.handle('app:rendererReady', () => {
    const win = getMainWindow();
    if (win) {
      rendererReadyWindows.add(win);
    }
    return true;
  });

  ipcMain.handle('app:openExternal', (_event, url: string) => shell.openExternal(url));

  ipcMain.handle('app:openPath', (_event, path: string) => shell.openPath(path));

  ipcMain.handle('app:getConfigDir', () => getConfigDir());

  ipcMain.on('app:quit', () => {
    app.quit();
  });
};
