import type { IpcMain } from 'electron';
import { app } from 'electron';
import { loadConfig, saveConfig } from './services/config.service.js';
import { listAgents, runAgent } from './services/agent.service.js';

export const registerIpcHandlers = (ipcMain: IpcMain): void => {
  // Agent handlers
  ipcMain.handle('agents:list', async () => listAgents());

  ipcMain.handle('agents:run', async (_event, name: string, prompt: string) =>
    runAgent(name, prompt)
  );

  // Config handlers
  ipcMain.handle('config:get', async () => loadConfig());

  ipcMain.handle('config:set', async (_event, key: string, value: unknown) => {
    const config = await loadConfig();
    const updated = { ...config, [key]: value };
    await saveConfig(updated);
  });

  // App handlers
  ipcMain.handle('app:version', () => app.getVersion());

  ipcMain.on('app:quit', () => {
    app.quit();
  });
};
