import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import type {
  AutodiscoverResult,
  KeyProvider,
  LoadKeysResult,
  ProviderKeyConfig,
  SaveKeyResult,
  ValidateKeyResponse,
} from '../../shared/types/index.js';
import { loadConfig, saveConfig } from './config.service.js';

/**
 * Known Anthropic models (hardcoded since API doesn't list them)
 */
const ANTHROPIC_MODELS = [
  'claude-sonnet-4-20250514',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
  'claude-3-haiku-20240307',
];

/**
 * Autodiscover API keys from environment variables and config files
 */
export const autodiscoverKeys = async (): Promise<AutodiscoverResult> => {
  const result: AutodiscoverResult = {};

  // Check environment variables
  const anthropicEnv = process.env.ANTHROPIC_API_KEY;
  const openaiEnv = process.env.OPENAI_API_KEY;

  if (anthropicEnv) {
    result.anthropic = anthropicEnv;
  }

  if (openaiEnv) {
    result.openai = openaiEnv;
  }

  // Check common config file locations
  const home = homedir();

  // Anthropic key locations
  if (!result.anthropic) {
    const anthropicPaths = [
      join(home, '.anthropic', 'api_key'),
      join(home, '.config', 'anthropic', 'api_key'),
    ];

    for (const filePath of anthropicPaths) {
      try {
        const content = await readFile(filePath, 'utf-8');
        const key = content.trim();
        if (key.startsWith('sk-ant-')) {
          result.anthropic = key;
          break;
        }
      } catch {
        // File not found, continue
      }
    }

    // Check Claude CLI credentials file
    if (!result.anthropic) {
      const claudeCredentialsPath = join(home, '.claude', '.credentials.json');
      try {
        const content = await readFile(claudeCredentialsPath, 'utf-8');
        const credentials = JSON.parse(content) as {
          claudeAiOauth?: { accessToken?: string };
        };
        const key = credentials.claudeAiOauth?.accessToken;
        if (key) {
          result.anthropic = key;
        }
      } catch {
        // File not found, continue
      }
    }
  }

  // OpenAI key locations
  if (!result.openai) {
    const openaiPaths = [
      join(home, '.config', 'openai.key'),
      join(home, '.openai', 'api_key'),
      join(home, '.config', 'openai', 'api_key'),
    ];

    for (const filePath of openaiPaths) {
      try {
        const content = await readFile(filePath, 'utf-8');
        const key = content.trim();
        if (key.startsWith('sk-')) {
          result.openai = key;
          break;
        }
      } catch {
        // File not found, continue
      }
    }
  }

  return result;
};

/**
 * Validate an API key by making a test request
 */
export const validateKey = async (
  provider: KeyProvider,
  key: string
): Promise<ValidateKeyResponse> => {
  try {
    if (provider === 'openai') {
      return await validateOpenAIKey(key);
    }
    return await validateAnthropicKey(key);
  } catch {
    return { valid: false, error: 'network_error' };
  }
};

/**
 * Validate OpenAI API key by fetching models list
 */
const validateOpenAIKey = async (key: string): Promise<ValidateKeyResponse> => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    if (response.status === 401) {
      return { valid: false, error: 'invalid_key' };
    }

    if (!response.ok) {
      return { valid: false, error: 'network_error' };
    }

    const data = (await response.json()) as { data?: { id: string }[] };
    const models =
      data.data
        ?.filter((m) => m.id.startsWith('gpt-') || m.id.startsWith('o1') || m.id.startsWith('o3'))
        .map((m) => m.id)
        .sort() ?? [];

    return { valid: true, models };
  } catch {
    return { valid: false, error: 'network_error' };
  }
};

/**
 * Validate Anthropic API key or OAuth token by making a minimal API call
 */
const validateAnthropicKey = async (key: string): Promise<ValidateKeyResponse> => {
  // Detect key type from prefix
  const isOAuthToken = key.startsWith('sk-ant-oat');
  const isJWT = key.startsWith('eyJ');

  if (isJWT) {
    return { valid: false, error: 'invalid_key' };
  }

  try {
    // OAuth tokens use Bearer auth, API keys use x-api-key header
    const headers: Record<string, string> = {
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    };

    if (isOAuthToken) {
      headers.Authorization = `Bearer ${key}`;
      headers['anthropic-beta'] = 'oauth-2025-04-20';
    } else {
      headers['x-api-key'] = key;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    });

    if (response.status === 401) {
      return { valid: false, error: 'invalid_key' };
    }

    if (response.status === 200 || response.status === 429 || response.status === 400) {
      return { valid: true, models: ANTHROPIC_MODELS };
    }

    return { valid: false, error: 'network_error' };
  } catch {
    return { valid: false, error: 'network_error' };
  }
};

/**
 * Load saved keys configuration from config file
 */
export const loadKeys = async (): Promise<LoadKeysResult> => {
  const config = await loadConfig();
  const providers: ProviderKeyConfig[] = [];

  // Convert from models array to provider key configs
  for (const model of config.models ?? []) {
    if ((model.provider === 'openai' || model.provider === 'anthropic') && model.apiKey) {
      // Check if we already have this provider
      const existing = providers.find((p) => p.provider === model.provider);
      if (!existing) {
        providers.push({
          provider: model.provider,
          key: model.apiKey,
          enabledModels: model.defaultModel ? [model.defaultModel] : [],
        });
      }
    }
  }

  return { providers };
};

/**
 * Save a provider key configuration
 */
export const saveKey = async (
  provider: KeyProvider,
  key: string,
  enabledModels: string[]
): Promise<SaveKeyResult> => {
  try {
    const config = await loadConfig();
    const models = config.models ?? [];

    // Find existing provider model entry
    const existingIndex = models.findIndex((m) => m.provider === provider);

    const providerConfig = {
      id: provider,
      provider: provider as 'openai' | 'anthropic',
      apiKey: key,
      defaultModel: enabledModels[0],
      isDefault: existingIndex === -1 && models.length === 0,
    };

    if (existingIndex >= 0) {
      models[existingIndex] = providerConfig;
    } else {
      models.push(providerConfig);
    }

    await saveConfig({ ...config, models });
    return { success: true };
  } catch (error) {
    console.error('Failed to save key:', error);
    return { success: false, error: 'Failed to save configuration' };
  }
};
