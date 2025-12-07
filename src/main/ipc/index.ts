import type { IpcMain } from 'electron';
import { registerAgentsHandlers } from './agents.handler.js';
import { registerAppHandlers } from './app.handler.js';
import { registerAuthHandlers } from './auth.handler.js';
import { registerConfigHandlers } from './config.handler.js';

export const registerIpcHandlers = (ipcMain: IpcMain): void => {
  registerAgentsHandlers(ipcMain);
  registerAuthHandlers(ipcMain);
  registerConfigHandlers(ipcMain);
  registerAppHandlers(ipcMain);
};
