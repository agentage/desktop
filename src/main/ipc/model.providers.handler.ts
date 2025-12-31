import type { IpcMain } from 'electron';
import type { ModelProviderType, SaveProviderRequest } from '../../shared/types/index.js';
import { loadProviders, saveProvider, validateToken } from '../services/model.providers.service.js';

export const registerModelProvidersHandlers = (ipcMain: IpcMain): void => {
  /**
   * Load all model providers with their models from configuration
   * If autoRefresh is true, re-fetch models from API for stale providers (> 1 day)
   */
  ipcMain.handle('models:providers:load', async (_event, autoRefresh?: boolean) =>
    loadProviders(autoRefresh)
  );

  /**
   * Save a model provider configuration (token and models selection)
   */
  ipcMain.handle('models:providers:save', async (_event, request: SaveProviderRequest) =>
    saveProvider(request)
  );

  /**
   * Validate provider token & fetch models
   */
  ipcMain.handle(
    'models:validate',
    async (_event, request: { provider: ModelProviderType; token: string }) =>
      validateToken(request.provider, request.token)
  );
};
