import type { IpcMain } from 'electron';
import type {
  OAuthConnectRequest,
  OAuthConnectResult,
  OAuthDisconnectRequest,
  OAuthDisconnectResult,
  OAuthListResult,
} from '../../../shared/types/oauth.types.js';
import { getOAuthManager } from '../../services/oauth/index.js';

/**
 * Register OAuth connect IPC handlers
 */
export const registerOAuthConnectHandlers = (ipcMain: IpcMain): void => {
  const manager = getOAuthManager();

  /**
   * List all OAuth providers and their connection status
   */
  ipcMain.handle('oauth:list', async (): Promise<OAuthListResult> => manager.list());

  /**
   * Connect to an OAuth provider
   */
  ipcMain.handle(
    'oauth:connect',
    async (_event, request: OAuthConnectRequest): Promise<OAuthConnectResult> =>
      manager.connect(request.providerId)
  );

  /**
   * Disconnect from an OAuth provider
   */
  ipcMain.handle(
    'oauth:disconnect',
    async (_event, request: OAuthDisconnectRequest): Promise<OAuthDisconnectResult> =>
      manager.disconnect(request.providerId)
  );
};
