import type { BrowserWindow, IpcMain } from 'electron';
import { registerAgentsHandlers } from './agents.handler.js';
import { registerAppHandlers, setupRendererReadyMonitor } from './app.handler.js';
import { registerAuthHandlers } from './auth.handler.js';
import { registerConfigHandlers } from './config.handler.js';
import { registerModelProvidersHandlers } from './model.providers.handler.js';
import { registerOAuthHandlers } from './oauth.handler.js';
import { registerWindowHandlers } from './window.handler.js';
import { registerWorkspaceHandlers } from './workspace.handler.js';

export { setupRendererReadyMonitor };

export const registerIpcHandlers = (
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null
): void => {
  registerAgentsHandlers(ipcMain);
  registerAuthHandlers(ipcMain);
  registerConfigHandlers(ipcMain);
  registerModelProvidersHandlers(ipcMain);
  registerOAuthHandlers(ipcMain);
  registerAppHandlers(ipcMain, getMainWindow);
  registerWindowHandlers(ipcMain, getMainWindow);
  registerWorkspaceHandlers(ipcMain, getMainWindow);
};
