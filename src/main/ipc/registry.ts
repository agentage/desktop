import type { IpcMain, BrowserWindow } from 'electron';
import type { Handler } from './types';

/**
 * IPC handler registry for type-safe registration
 */
export const createRegistry = (): {
  register: (handler: Handler) => void;
  registerAll: (ipcMain: IpcMain, getMainWindow: () => BrowserWindow | null) => void;
} => {
  const handlers: Handler[] = [];

  return {
    /**
     * Register a handler function
     */
    register: (handler: Handler): void => {
      handlers.push(handler);
    },

    /**
     * Register all handlers with context
     */
    registerAll: (ipcMain: IpcMain, getMainWindow: () => BrowserWindow | null): void => {
      handlers.forEach((handler) => {
        // Check if handler needs context (2 params) or just ipcMain (1 param)
        if (handler.length === 2) {
          // WindowHandler
          (handler as (ipcMain: IpcMain, getMainWindow: () => BrowserWindow | null) => void)(
            ipcMain,
            getMainWindow
          );
        } else {
          // SimpleHandler
          (handler as (ipcMain: IpcMain) => void)(ipcMain);
        }
      });
    },
  };
};
