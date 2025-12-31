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
      const tokens = await authorizeWithAnthropic();

      // Try to create API key using OAuth token
      let apiKey: string | undefined;
      try {
        apiKey = await createApiKeyWithOAuth(tokens.accessToken);
      } catch {
        // API key creation is optional - token works without it
      }

      return { success: true, tokens, apiKey };
    } catch (error) {
      console.error('[OAuth] Anthropic authorize error:', error);
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
      const tokens = await authorizeWithOpenAI();

      // Try to exchange id_token for a long-lived API key (optional)
      let apiKey: string | undefined;
      try {
        apiKey = await exchangeIdTokenForApiKey(tokens.idToken);
      } catch {
        // API key exchange is optional - access token works for ChatGPT API
      }

      return { success: true, tokens, apiKey };
    } catch (error) {
      console.error('[OAuth] OpenAI authorize error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });
};
