import type { IpcMain } from 'electron';
import {
  authorizeWithAnthropic,
  createApiKeyWithOAuth,
  type OAuthTokens,
} from '../services/anthropic.oauth.service.js';
import {
  authorizeWithOpenAI,
  exchangeIdTokenForApiKey,
  type OpenAIOAuthTokens,
} from '../services/openai.oauth.service.js';

interface AnthropicOAuthResult {
  success: boolean;
  tokens?: OAuthTokens;
  apiKey?: string;
  error?: string;
}

interface OpenAIOAuthResult {
  success: boolean;
  tokens?: OpenAIOAuthTokens;
  apiKey?: string;
  error?: string;
}

export const registerOAuthHandlers = (ipcMain: IpcMain): void => {
  /**
   * Anthropic OAuth: Start authorization flow
   */
  ipcMain.handle('models:anthropic:authorize', async (): Promise<AnthropicOAuthResult> => {
    try {
      console.log('[ipc] models:anthropic:authorize called');
      const tokens = await authorizeWithAnthropic();

      // Try to create API key using OAuth token
      let apiKey: string | undefined;
      try {
        apiKey = await createApiKeyWithOAuth(tokens.accessToken);
        console.log('[ipc] models:anthropic:authorize - API key created');
      } catch (keyError) {
        console.log(
          '[ipc] models:anthropic:authorize - API key creation failed (optional):',
          keyError instanceof Error ? keyError.message : String(keyError)
        );
      }

      return { success: true, tokens, apiKey };
    } catch (error) {
      console.error('[ipc] models:anthropic:authorize error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  /**
   * OpenAI OAuth: Start authorization flow via ChatGPT login
   */
  ipcMain.handle('models:openai:authorize', async (): Promise<OpenAIOAuthResult> => {
    try {
      console.log('[ipc] models:openai:authorize called');
      const tokens = await authorizeWithOpenAI();
      console.log('[ipc] models:openai:authorize - tokens received:', {
        hasIdToken: !!tokens.idToken,
        idTokenPrefix: tokens.idToken.substring(0, 20) + '...',
        hasAccessToken: !!tokens.accessToken,
        accessTokenPrefix: tokens.accessToken.substring(0, 20) + '...',
        hasRefreshToken: !!tokens.refreshToken,
        accountId: tokens.accountId,
      });

      // Try to exchange id_token for a long-lived API key (optional)
      let apiKey: string | undefined;
      try {
        apiKey = await exchangeIdTokenForApiKey(tokens.idToken);
        console.log('[ipc] models:openai:authorize - API key obtained');
      } catch (exchangeError) {
        console.log(
          '[ipc] models:openai:authorize - API key exchange failed (will use access token):',
          exchangeError instanceof Error ? exchangeError.message : String(exchangeError)
        );
      }

      return { success: true, tokens, apiKey };
    } catch (error) {
      console.error('[ipc] models:openai:authorize error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
};
