import type { IpcMain } from 'electron';
import { loadConfig, saveConfig } from '../services/config.service.js';

export const registerConfigHandlers = (ipcMain: IpcMain): void => {
  ipcMain.handle('config:get', async () => loadConfig());

  ipcMain.handle('config:set', async (_event, key: string, value: unknown) => {
    const config = await loadConfig();
    const updated = { ...config, [key]: value };
    await saveConfig(updated);
  });
};
