import type { IpcMain } from 'electron';
import type { KeyProvider, ProviderKeyConfig } from '../../shared/types/index.js';
import { autodiscoverKeys, loadKeys, saveKey, validateKey } from '../services/keys.service.js';

export const registerKeysHandlers = (ipcMain: IpcMain): void => {
  /**
   * Autodiscover API keys from environment and config files
   */
  ipcMain.handle('keys:autodiscover', async () => autodiscoverKeys());

  /**
   * Validate an API key
   */
  ipcMain.handle('keys:validate', async (_event, request: { provider: KeyProvider; key: string }) =>
    validateKey(request.provider, request.key)
  );

  /**
   * Save a provider key configuration
   */
  ipcMain.handle('keys:save', async (_event, config: ProviderKeyConfig) =>
    saveKey(config.provider, config.key, config.enabledModels)
  );

  /**
   * Load saved keys configuration
   */
  ipcMain.handle('keys:load', async () => loadKeys());
};
