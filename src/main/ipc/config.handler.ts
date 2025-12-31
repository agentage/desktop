import type { IpcMain } from 'electron';
import type { Settings } from '../../shared/types/index.js';
import { getSettings, loadConfig, saveConfig, updateSettings } from '../services/config.service.js';

export const registerConfigHandlers = (ipcMain: IpcMain): void => {
  ipcMain.handle('config:get', async () => loadConfig());

  ipcMain.handle('config:set', async (_event, key: string, value: unknown) => {
    const config = await loadConfig();
    const updated = { ...config, [key]: value };
    await saveConfig(updated);
  });

  // Settings handlers
  ipcMain.handle('settings:get', async () => getSettings());

  ipcMain.handle('settings:update', async (_event, updates: Partial<Settings>) => {
    await updateSettings(updates);
  });
};
