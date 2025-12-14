import type { IpcMain } from 'electron';
import type { ModelProvider, Settings } from '../../shared/types/index.js';
import {
  getModelProvider,
  getSettings,
  loadConfig,
  removeModelProvider,
  saveConfig,
  setModelProvider,
  updateSettings,
} from '../services/config.service.js';

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

  // Model provider handlers
  ipcMain.handle('settings:getModelProvider', async (_event, id: string) => getModelProvider(id));

  ipcMain.handle('settings:setModelProvider', async (_event, provider: ModelProvider) => {
    await setModelProvider(provider);
  });

  ipcMain.handle('settings:removeModelProvider', async (_event, id: string) => {
    await removeModelProvider(id);
  });
};
