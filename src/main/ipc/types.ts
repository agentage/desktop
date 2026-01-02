import type { IpcMain, BrowserWindow } from 'electron';

/**
 * Context passed to IPC handlers
 */
export interface HandlerContext {
  ipcMain: IpcMain;
  getMainWindow: () => BrowserWindow | null;
}

/**
 * Simple handler that doesn't need window reference
 */
export type SimpleHandler = (ipcMain: IpcMain) => void;

/**
 * Handler that needs window reference
 */
export type WindowHandler = (ctx: HandlerContext) => void;

/**
 * Generic handler function type
 */
export type Handler = SimpleHandler | WindowHandler;
