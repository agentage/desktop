import type { IpcMain } from 'electron';
import { app } from 'electron';
import type { AuthResult, OAuthProvider } from '../shared/types/auth.types.js';
import { listAgents, runAgent } from './services/agent.service.js';
import { getUser, logout, refreshTokenIfNeeded, startOAuthFlow } from './services/auth.service.js';
import { loadConfig, saveConfig } from './services/config.service.js';

export const registerIpcHandlers = (ipcMain: IpcMain): void => {
  // Agent handlers
  ipcMain.handle('agents:list', async () => listAgents());

  ipcMain.handle('agents:run', async (_event, name: string, prompt: string) =>
    runAgent(name, prompt)
  );

  // Auth handlers
  ipcMain.handle('auth:login', async (_event, provider: OAuthProvider): Promise<AuthResult> => {
    try {
      const authState = await startOAuthFlow(provider);
      return { success: true, user: authState.user };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('auth:logout', async () => {
    await logout();
    return { success: true };
  });

  ipcMain.handle('auth:getUser', async () => {
    await refreshTokenIfNeeded();
    return getUser();
  });

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
