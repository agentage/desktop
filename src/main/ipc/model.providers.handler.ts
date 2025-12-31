import type { IpcMain } from 'electron';
import type { ModelProviderType, SaveProviderRequest } from '../../shared/types/index.js';
import { loadProviders, saveProvider, validateToken } from '../services/model.providers.service.js';

export const registerModelProvidersHandlers = (ipcMain: IpcMain): void => {
  /**
   * Load all model providers with their models from configuration
   * If autoRefresh is true, re-fetch models from API for stale providers (> 1 day)
   */
  ipcMain.handle('models:providers:load', async (_event, autoRefresh?: boolean) => {
    console.log('[IPC] models:providers:load called, autoRefresh:', autoRefresh);
    const result = await loadProviders(autoRefresh);
    console.log('[IPC] models:providers:load result:', {
      providersCount: result.providers.length,
      providers: result.providers.map((p) => ({
        provider: p.provider,
        enabled: p.enabled,
        modelsCount: p.models.length,
      })),
    });
    return result;
  });

  /**
   * Save a model provider configuration (token and models selection)
   */
  ipcMain.handle('models:providers:save', async (_event, request: SaveProviderRequest) => {
    console.log('[IPC] models:providers:save called:', {
      provider: request.provider,
      enabled: request.enabled,
      modelsCount: request.models.length,
    });
    const result = await saveProvider(request);
    console.log('[IPC] models:providers:save result:', result);
    return result;
  });

  /**
   * Validate provider token & fetch models
   */
  ipcMain.handle(
    'models:validate',
    async (_event, request: { provider: ModelProviderType; token: string }) => {
      console.log('[IPC] models:validate called for provider:', request.provider);
      const result = await validateToken(request.provider, request.token);
      console.log('[IPC] models:validate result:', {
        provider: request.provider,
        valid: result.valid,
        modelsCount: result.models?.length ?? 0,
        models: result.models,
        error: result.error,
      });
      return result;
    }
  );
};
