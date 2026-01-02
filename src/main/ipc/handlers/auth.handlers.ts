import type { IpcMain } from 'electron';
import type {
  AuthResult,
  LinkedProvider,
  LinkProviderResult,
  OAuthProvider,
  UnlinkProviderResult,
} from '../../../shared/types/auth.types.js';
import {
  getLinkedProviders,
  getUser,
  linkProvider,
  logout,
  refreshTokenIfNeeded,
  startOAuthFlow,
  unlinkProvider,
} from '../../services/auth.service.js';

export const registerAuthHandlers = (ipcMain: IpcMain): void => {
  ipcMain.handle('auth:login', async (): Promise<AuthResult> => {
    try {
      const authState = await startOAuthFlow();

      if (!authState.user) {
        throw new Error('Authentication succeeded but user info is missing');
      }

      return { success: true, user: authState.user };
    } catch (error) {
      console.error('[Auth] OAuth flow failed:', error);
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

  ipcMain.handle(
    'auth:linkProvider',
    async (_event, provider: OAuthProvider): Promise<LinkProviderResult> => {
      try {
        return await linkProvider(provider);
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    }
  );

  ipcMain.handle(
    'auth:unlinkProvider',
    async (_event, provider: OAuthProvider): Promise<UnlinkProviderResult> => {
      try {
        return await unlinkProvider(provider);
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    }
  );

  ipcMain.handle('auth:getProviders', async (): Promise<LinkedProvider[]> => {
    try {
      return await getLinkedProviders();
    } catch (error) {
      console.error('Failed to get linked providers:', error);
      return [];
    }
  });
};
