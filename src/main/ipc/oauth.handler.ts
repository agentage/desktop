import type { IpcMain } from 'electron';
import {
  authorizeWithAnthropic,
  createApiKeyWithOAuth,
  getExistingClaudeTokens,
  type OAuthTokens,
} from '../services/oauth.service.js';

interface OAuthAuthorizeResult {
  success: boolean;
  tokens?: OAuthTokens;
  error?: string;
}

interface CreateApiKeyResult {
  success: boolean;
  apiKey?: string;
  error?: string;
}

export const registerOAuthHandlers = (ipcMain: IpcMain): void => {
  /**
   * Get existing OAuth tokens from Claude CLI credentials
   * Returns tokens if user has already authenticated with Claude CLI
   */
  ipcMain.handle('oauth:getExistingTokens', async (): Promise<OAuthAuthorizeResult> => {
    try {
      console.log('[ipc] oauth:getExistingTokens called');
      const tokens = await getExistingClaudeTokens();
      if (tokens) {
        return { success: true, tokens };
      }
      return {
        success: false,
        error: 'No valid tokens found. Please run "claude" CLI to authenticate first.',
      };
    } catch (error) {
      console.error('[ipc] oauth:getExistingTokens error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Start OAuth authorization flow with Anthropic
   * Opens browser for user to authenticate
   * NOTE: This may fail due to Cloudflare protection
   */
  ipcMain.handle('oauth:authorize', async (): Promise<OAuthAuthorizeResult> => {
    try {
      console.log('[ipc] oauth:authorize called');
      const tokens = await authorizeWithAnthropic();
      return { success: true, tokens };
    } catch (error) {
      console.error('[ipc] oauth:authorize error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * Create an API key using OAuth token
   */
  ipcMain.handle(
    'oauth:createApiKey',
    async (_event, accessToken: string, name?: string): Promise<CreateApiKeyResult> => {
      try {
        console.log('[ipc] oauth:createApiKey called');
        const apiKey = await createApiKeyWithOAuth(accessToken, name);
        return { success: true, apiKey };
      } catch (error) {
        console.error('[ipc] oauth:createApiKey error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );
};
