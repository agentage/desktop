import { useCallback, useEffect, useState } from 'react';
import type {
  KeyProvider,
  ProviderKeyConfig,
  ValidateKeyResponse,
} from '../../shared/types/index.js';
import {
  AlertCircleIcon,
  BrainIcon,
  Button,
  CheckCircleIcon,
  CheckIcon,
  IconButton,
  KeyIcon,
  RefreshIcon,
  Section,
} from '../components/ui/index.js';

interface ProviderState {
  key: string;
  maskedKey: string;
  status: 'empty' | 'validating' | 'valid' | 'invalid';
  models: string[];
  enabledModels: string[];
  error?: string;
  isDirty: boolean;
}

const PROVIDER_LABELS: Record<KeyProvider, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
};

const PROVIDER_KEY_PREFIXES: Record<KeyProvider, string> = {
  anthropic: 'sk-ant-',
  openai: 'sk-',
};

/**
 * Mask API key for display (show last 4 chars only)
 */
const maskKey = (key: string): string => {
  if (!key || key.length < 8) return key;
  return `${'•'.repeat(key.length - 4)}${key.slice(-4)}`;
};

/**
 * Models page - manage API keys for LLM providers
 * Route: /models
 */
export const ModelsPage = (): React.JSX.Element => {
  const [providers, setProviders] = useState<Record<KeyProvider, ProviderState>>({
    anthropic: {
      key: '',
      maskedKey: '',
      status: 'empty',
      models: [],
      enabledModels: [],
      isDirty: false,
    },
    openai: {
      key: '',
      maskedKey: '',
      status: 'empty',
      models: [],
      enabledModels: [],
      isDirty: false,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<KeyProvider | null>(null);
  const [authorizing, setAuthorizing] = useState(false);

  /**
   * Validate a provider's API key
   */
  const validateProviderKey = useCallback(
    async (provider: KeyProvider, key: string): Promise<void> => {
      if (!key) {
        setProviders((prev) => ({
          ...prev,
          [provider]: { ...prev[provider], status: 'empty', models: [], error: undefined },
        }));
        return;
      }

      setProviders((prev) => ({
        ...prev,
        [provider]: { ...prev[provider], status: 'validating', error: undefined },
      }));

      try {
        const result: ValidateKeyResponse = await window.agentage.keys.validate({
          provider,
          key,
        });

        setProviders((prev) => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            status: result.valid ? 'valid' : 'invalid',
            models: result.models ?? [],
            enabledModels:
              result.valid && result.models
                ? prev[provider].enabledModels.length > 0
                  ? prev[provider].enabledModels.filter((m) => result.models?.includes(m))
                  : result.models.slice(0, 3) // Default to first 3 models
                : [],
            error: result.error
              ? result.error === 'oauth_token'
                ? 'This is a Claude CLI OAuth token, not an API key. Get your API key from console.anthropic.com/settings/keys'
                : result.error === 'invalid_key'
                  ? 'Invalid API key'
                  : 'Network error - please try again'
              : undefined,
          },
        }));
      } catch {
        setProviders((prev) => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            status: 'invalid',
            error: 'Validation failed',
          },
        }));
      }
    },
    []
  );

  /**
   * Load saved keys on mount
   */
  useEffect(() => {
    const loadSavedKeys = async (): Promise<void> => {
      try {
        const result = await window.agentage.keys.load();
        const updates: Partial<Record<KeyProvider, ProviderState>> = {};

        for (const config of result.providers) {
          updates[config.provider] = {
            key: config.key,
            maskedKey: maskKey(config.key),
            status: 'valid', // Assume saved keys are valid
            models: [],
            enabledModels: config.enabledModels,
            isDirty: false,
          };
        }

        if (Object.keys(updates).length > 0) {
          setProviders((prev) => ({ ...prev, ...updates }));
          // Validate saved keys to get model list
          for (const provider of Object.keys(updates) as KeyProvider[]) {
            const state = updates[provider];
            if (state?.key) {
              void validateProviderKey(provider, state.key);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load keys:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadSavedKeys();
  }, [validateProviderKey]);

  /**
   * Handle key input change
   */
  const handleKeyChange = useCallback((provider: KeyProvider, value: string): void => {
    setProviders((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        key: value,
        maskedKey: maskKey(value),
        status: value ? 'empty' : 'empty',
        isDirty: true,
      },
    }));
  }, []);

  /**
   * Handle validate button click
   */
  const handleValidate = useCallback(
    (provider: KeyProvider): void => {
      const key = providers[provider].key;
      if (key) {
        void validateProviderKey(provider, key);
      }
    },
    [providers, validateProviderKey]
  );

  /**
   * Handle model selection toggle
   */
  const handleModelToggle = useCallback((provider: KeyProvider, model: string): void => {
    setProviders((prev) => {
      const current = prev[provider];
      const enabled = current.enabledModels.includes(model)
        ? current.enabledModels.filter((m) => m !== model)
        : [...current.enabledModels, model];

      return {
        ...prev,
        [provider]: {
          ...current,
          enabledModels: enabled,
          isDirty: true,
        },
      };
    });
  }, []);

  /**
   * Save provider configuration
   */
  const handleSave = useCallback(
    async (provider: KeyProvider): Promise<void> => {
      setSaving(provider);
      try {
        const state = providers[provider];
        const config: ProviderKeyConfig = {
          provider,
          key: state.key,
          enabledModels: state.enabledModels,
        };
        const result = await window.agentage.keys.save(config);

        if (result.success) {
          setProviders((prev) => ({
            ...prev,
            [provider]: { ...prev[provider], isDirty: false },
          }));
        } else {
          console.error('Failed to save:', result.error);
        }
      } catch (error) {
        console.error('Save failed:', error);
      } finally {
        setSaving(null);
      }
    },
    [providers]
  );

  /**
   * Handle "Authorize with Claude" button click
   * Opens browser for OAuth flow, then uses the token for API access
   */
  const handleAuthorizeWithClaude = useCallback(async (): Promise<void> => {
    setAuthorizing(true);
    try {
      // Step 1: OAuth flow - open browser for user authentication
      const authResult = await window.agentage.oauth.authorize();

      if (!authResult.success || !authResult.tokens) {
        console.error('OAuth authorization failed:', authResult.error);
        setProviders((prev) => ({
          ...prev,
          anthropic: {
            ...prev.anthropic,
            error: authResult.error ?? 'Authorization failed',
          },
        }));
        return;
      }

      const { accessToken, scopes } = authResult.tokens;
      const hasApiKeyScope = scopes.includes('org:create_api_key');

      // Try to create an API key if we have the scope, otherwise use OAuth token directly
      let tokenToUse: string;

      if (hasApiKeyScope) {
        const keyResult = await window.agentage.oauth.createApiKey(accessToken, 'Agentage Desktop');
        tokenToUse = keyResult.success && keyResult.apiKey ? keyResult.apiKey : accessToken;
      } else {
        tokenToUse = accessToken;
      }

      // Set the token (API key or OAuth token)
      setProviders((prev) => ({
        ...prev,
        anthropic: {
          ...prev.anthropic,
          key: tokenToUse,
          maskedKey: maskKey(tokenToUse),
          isDirty: true,
          error: undefined,
        },
      }));

      // Validate the token
      void validateProviderKey('anthropic', tokenToUse);
    } catch {
      setProviders((prev) => ({
        ...prev,
        anthropic: {
          ...prev.anthropic,
          error: 'Authorization failed',
        },
      }));
    } finally {
      setAuthorizing(false);
    }
  }, [validateProviderKey]);

  /**
   * Render provider section
   */
  const renderProvider = (provider: KeyProvider): React.JSX.Element => {
    const state = providers[provider];
    const label = PROVIDER_LABELS[provider];
    const prefix = PROVIDER_KEY_PREFIXES[provider];

    return (
      <Section
        key={provider}
        icon={<KeyIcon />}
        iconColor={provider === 'anthropic' ? 'amber' : 'green'}
        title={label}
        description={`Configure your ${label} API key`}
      >
        <div className="space-y-4">
          {/* Key input */}
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={state.key}
              onChange={(e) => {
                handleKeyChange(provider, e.target.value);
              }}
              placeholder={`${prefix}...`}
              className="flex-1 px-2 py-1 text-sm font-mono border border-border rounded bg-background text-foreground focus:outline-none focus:border-primary"
            />
            {state.status === 'validating' ? (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <RefreshIcon />
              </span>
            ) : state.status === 'valid' ? (
              <span className="flex items-center text-green-500">
                <CheckCircleIcon />
              </span>
            ) : state.status === 'invalid' ? (
              <span className="flex items-center text-destructive" title={state.error}>
                <AlertCircleIcon />
              </span>
            ) : state.key ? (
              <IconButton
                icon={<CheckIcon />}
                onClick={() => {
                  handleValidate(provider);
                }}
                className="text-primary hover:bg-primary/10"
                title="Validate key"
              />
            ) : null}
          </div>

          {/* Model selection (only show when valid) */}
          {state.status === 'valid' && state.models.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Available Models</div>
              <div className="grid grid-cols-2 gap-2">
                {state.models.map((model) => (
                  <label
                    key={model}
                    className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={state.enabledModels.includes(model)}
                      onChange={() => {
                        handleModelToggle(provider, model);
                      }}
                      className="rounded border-border"
                    />
                    <span className="text-sm font-mono truncate">{model}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          {state.isDirty && state.status === 'valid' && (
            <div className="flex justify-end">
              <Button
                onClick={() => void handleSave(provider)}
                disabled={saving === provider}
                size="sm"
              >
                {saving === provider ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}

          {/* Authorize with Claude button (Anthropic only) */}
          {provider === 'anthropic' && !state.key && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Don't have an API key?</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleAuthorizeWithClaude()}
                  disabled={authorizing}
                >
                  {authorizing ? 'Authorizing...' : 'Sign in with Claude'}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Opens claude.ai to authenticate and automatically create an API key for you.
              </p>
            </div>
          )}

          {/* Error message */}
          {state.error && <div className="text-xs text-destructive">{state.error}</div>}
        </div>
      </Section>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 h-full">
      <div className="max-w-2xl mx-auto space-y-6 pb-48">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BrainIcon />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Models</h1>
        </div>

        {/* Provider sections */}
        <div className="space-y-3">
          {renderProvider('openai')}
          {renderProvider('anthropic')}
        </div>
      </div>
    </div>
  );
};
