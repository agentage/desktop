import type { BrowserWindow, IpcMain } from 'electron';
import type { ModelProviderType, SaveProviderRequest } from '../../../shared/types/index.js';
import { getModels } from '../../services/chat.service.js';
import { loadProviders, saveProvider, validateToken } from '../../services/model.providers.service.js';

export const registerModelProvidersHandlers = (
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null
): void => {
  /**
   * Load all model providers with their models from configuration
   * If autoRefresh is true, re-fetch models from API for stale providers (> 1 day)
   */
  ipcMain.handle('models.providers:load', async (_event, autoRefresh?: boolean) =>
    loadProviders(autoRefresh)
  );

  /**
   * Save a model provider configuration (token and models selection)
   * Emits models:changed event to notify renderer of updated models list
   */
  ipcMain.handle('models.providers:save', async (_event, request: SaveProviderRequest) => {
    const result = await saveProvider(request);
    // Emit models:changed event with updated enabled models list
    const mainWindow = getMainWindow();
    if (mainWindow) {
      const models = await getModels();
      mainWindow.webContents.send('models:changed', models);
    }
    return result;
  });

  /**
   * Validate provider token & fetch models
   */
  ipcMain.handle(
    'models:validate',
    async (_event, request: { provider: ModelProviderType; token: string }) =>
      validateToken(request.provider, request.token)
  );
};
