import type { IpcMain } from 'electron';
import type { AuthResult, OAuthProvider } from '../../shared/types/auth.types.js';
import { getUser, logout, refreshTokenIfNeeded, startOAuthFlow } from '../services/auth.service.js';

export const registerAuthHandlers = (ipcMain: IpcMain): void => {
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
};
