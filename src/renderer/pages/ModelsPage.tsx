import { useCallback, useEffect, useState } from 'react';
import type {
  ModelInfo,
  ModelProviderType,
  SaveProviderRequest,
  ValidateTokenResponse,
} from '../../shared/types/index.js';
import {
  AlertCircleIcon,
  AnthropicIcon,
  BrainIcon,
  Button,
  CheckCircleIcon,
  CheckIcon,
  IconButton,
  OpenAIIcon,
  RefreshIcon,
  Section,
} from '../components/ui/index.js';
import { cn } from '../lib/utils.js';

interface ProviderState {
  token: string;
  maskedToken: string;
  status: 'empty' | 'validating' | 'valid' | 'invalid';
  models: ModelInfo[];
  error?: string;
  isDirty: boolean;
}

const PROVIDER_LABELS: Record<ModelProviderType, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
};

const PROVIDER_TOKEN_PREFIXES: Record<ModelProviderType, string> = {
  anthropic: 'sk-ant-',
  openai: 'sk-',
};

/**
 * Mask token for display (show last 4 chars only)
 */
const maskToken = (token: string): string => {
  if (!token || token.length < 8) return token;
  return `${'•'.repeat(token.length - 4)}${token.slice(-4)}`;
};

/**
 * Models page - manage tokens for LLM providers
 * Route: /models
 */
export const ModelsPage = (): React.JSX.Element => {
  const [providers, setProviders] = useState<Record<ModelProviderType, ProviderState>>({
    anthropic: {
      token: '',
      maskedToken: '',
      status: 'empty',
      models: [],
      isDirty: false,
    },
    openai: {
      token: '',
      maskedToken: '',
      status: 'empty',
      models: [],
      isDirty: false,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<ModelProviderType | null>(null);
  const [authorizing, setAuthorizing] = useState(false);
  const [authorizingOpenAI, setAuthorizingOpenAI] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Validate a provider's token
   */
  const validateProviderToken = useCallback(
    async (provider: ModelProviderType, token: string): Promise<void> => {
      if (!token) {
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
        const result: ValidateTokenResponse = await window.agentage.models.validate({
          provider,
          token,
        });

        console.log(`[ModelsPage] Validation result for ${provider}:`, {
          valid: result.valid,
          models: result.models,
          modelsCount: result.models?.length ?? 0,
          error: result.error,
        });

        setProviders((prev) => {
          const existingModels = prev[provider].models;
          let newModels: ModelInfo[] = [];

          if (result.valid && result.models) {
            // Merge with existing enabled state
            newModels = result.models.map((m) => {
              const existing = existingModels.find((e) => e.id === m.id);
              return {
                ...m,
                enabled: existing?.enabled ?? m.enabled,
                isDefault: existing?.isDefault ?? m.isDefault,
              };
            });

            // If no models were previously enabled, enable first 3 by default
            const anyEnabled = newModels.some((m) => m.enabled);
            if (!anyEnabled && newModels.length > 0) {
              newModels = newModels.map((m, i) => ({
                ...m,
                enabled: i < 3,
              }));
            }
          }

          console.log(`[ModelsPage] Setting ${provider} state:`, {
            status: result.valid ? 'valid' : 'invalid',
            modelsCount: newModels.length,
            enabledCount: newModels.filter((m) => m.enabled).length,
          });

          return {
            ...prev,
            [provider]: {
              ...prev[provider],
              status: result.valid ? 'valid' : 'invalid',
              models: newModels,
              error: result.error
                ? result.error === 'invalid_token'
                  ? 'Invalid token'
                  : 'Network error - please try again'
                : undefined,
            },
          };
        });
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
   * Load saved providers on mount
   */
  useEffect(() => {
    const loadSavedProviders = async (): Promise<void> => {
      try {
        // Load providers with auto-refresh (will refresh models if > 1 day old)
        const result = await window.agentage.models.providers.load(true);
        console.log('[ModelsPage] Loaded saved providers:', result);
        const updates: Partial<Record<ModelProviderType, ProviderState>> = {};

        for (const config of result.providers) {
          console.log(`[ModelsPage] Loading config for ${config.provider}:`, {
            hasToken: !!config.token,
            modelsCount: config.models.length,
            enabled: config.enabled,
          });
          updates[config.provider] = {
            token: config.token,
            maskedToken: maskToken(config.token),
            status: 'valid', // Assume saved tokens are valid
            models: config.models,
            isDirty: false,
          };
        }

        if (Object.keys(updates).length > 0) {
          setProviders((prev) => ({ ...prev, ...updates }));
        }
      } catch (error) {
        console.error('Failed to load providers:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadSavedProviders();
  }, [validateProviderToken]);

  /**
   * Handle token input change
   */
  const handleTokenChange = useCallback((provider: ModelProviderType, value: string): void => {
    setProviders((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        token: value,
        maskedToken: maskToken(value),
        status: value ? 'empty' : 'empty',
        isDirty: true,
      },
    }));
  }, []);

  /**
   * Handle validate button click
   */
  const handleValidate = useCallback(
    (provider: ModelProviderType): void => {
      const token = providers[provider].token;
      if (token) {
        void validateProviderToken(provider, token);
      }
    },
    [providers, validateProviderToken]
  );

  /**
   * Handle model selection toggle
   */
  const handleModelToggle = useCallback((provider: ModelProviderType, modelId: string): void => {
    setProviders((prev) => {
      const current = prev[provider];
      const updatedModels = current.models.map((m) =>
        m.id === modelId ? { ...m, enabled: !m.enabled } : m
      );

      return {
        ...prev,
        [provider]: {
          ...current,
          models: updatedModels,
          isDirty: true,
        },
      };
    });
  }, []);

  /**
   * Save provider configuration
   */
  const handleSave = useCallback(
    async (provider: ModelProviderType): Promise<void> => {
      setSaving(provider);
      try {
        const state = providers[provider];
        const request: SaveProviderRequest = {
          provider,
          token: state.token,
          enabled: true,
          lastFetchedAt: new Date().toISOString(),
          models: state.models,
        };
        const result = await window.agentage.models.providers.save(request);

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
      // OAuth flow - open browser for user authentication
      const authResult = await window.agentage.models.anthropic.authorize();

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

      // Use API key if created, otherwise fallback to access token
      const tokenToUse = authResult.apiKey ?? authResult.tokens.accessToken;

      // Set the token
      setProviders((prev) => ({
        ...prev,
        anthropic: {
          ...prev.anthropic,
          token: tokenToUse,
          maskedToken: maskToken(tokenToUse),
          isDirty: true,
          error: undefined,
        },
      }));

      // Validate the token
      void validateProviderToken('anthropic', tokenToUse);
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
  }, [validateProviderToken]);

  /**
   * Handle "Sign in with OpenAI" button click
   * Opens browser for ChatGPT OAuth flow, gets access token for ChatGPT backend API
   */
  const handleAuthorizeWithOpenAI = useCallback(async (): Promise<void> => {
    setAuthorizingOpenAI(true);
    try {
      // OAuth flow - open browser for ChatGPT authentication
      const authResult = await window.agentage.models.openai.authorize();

      if (!authResult.success) {
        console.error('OpenAI OAuth authorization failed:', authResult.error);
        setProviders((prev) => ({
          ...prev,
          openai: {
            ...prev.openai,
            error: authResult.error ?? 'Authorization failed',
          },
        }));
        return;
      }

      // Use the access token (JWT) for ChatGPT backend API
      const tokenToUse = authResult.tokens?.accessToken;

      if (!tokenToUse) {
        setProviders((prev) => ({
          ...prev,
          openai: {
            ...prev.openai,
            error: 'No access token received',
          },
        }));
        return;
      }

      // Set the token
      setProviders((prev) => ({
        ...prev,
        openai: {
          ...prev.openai,
          token: tokenToUse,
          maskedToken: maskToken(tokenToUse),
          isDirty: true,
          error: undefined,
        },
      }));

      // Validate the token (will use ChatGPT backend API)
      void validateProviderToken('openai', tokenToUse);
    } catch {
      setProviders((prev) => ({
        ...prev,
        openai: {
          ...prev.openai,
          error: 'Authorization failed',
        },
      }));
    } finally {
      setAuthorizingOpenAI(false);
    }
  }, [validateProviderToken]);

  /**
   * Handle refresh button - force re-fetch models from all providers
   */
  const handleRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      // Force refresh all providers in parallel
      const refreshPromises = (Object.entries(providers) as [ModelProviderType, ProviderState][])
        .filter(([, state]) => state.token)
        .map(([provider, state]) => validateProviderToken(provider, state.token));

      await Promise.all(refreshPromises);
    } catch (error) {
      console.error('Failed to refresh providers:', error);
    } finally {
      setRefreshing(false);
    }
  }, [providers, validateProviderToken]);

  /**
   * Render provider section
   */
  const renderProvider = (provider: ModelProviderType): React.JSX.Element => {
    const state = providers[provider];
    const label = PROVIDER_LABELS[provider];
    const prefix = PROVIDER_TOKEN_PREFIXES[provider];
    const icon = provider === 'anthropic' ? <AnthropicIcon /> : <OpenAIIcon />;
    const iconColor = provider === 'anthropic' ? 'amber' : 'green';

    return (
      <Section
        key={provider}
        icon={icon}
        iconColor={iconColor}
        title={label}
        description={`Configure your ${label} token`}
      >
        <div className="space-y-4">
          {/* Token input */}
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={state.token}
              onChange={(e) => {
                handleTokenChange(provider, e.target.value);
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
            ) : state.token ? (
              <IconButton
                icon={<CheckIcon />}
                onClick={() => {
                  handleValidate(provider);
                }}
                className="text-primary hover:bg-primary/10"
                title="Validate token"
              />
            ) : null}
          </div>

          {/* Model selection (only show when valid) */}
          {((): null => {
            console.log(`[ModelsPage] Rendering ${provider}:`, {
              status: state.status,
              modelsCount: state.models.length,
              models: state.models,
            });
            return null;
          })()}
          {state.status === 'valid' && state.models.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Available Models</div>
              <div className="grid grid-cols-2 gap-2">
                {state.models.map((model) => (
                  <label
                    key={model.id}
                    className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={model.enabled}
                      onChange={() => {
                        handleModelToggle(provider, model.id);
                      }}
                      className="rounded border-border"
                    />
                    <span className="text-sm font-mono truncate" title={model.id}>
                      {model.displayName}
                    </span>
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
          {provider === 'anthropic' && !state.token && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Don't have a token?</div>
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

          {/* Sign in with OpenAI button (OpenAI only) */}
          {provider === 'openai' && !state.token && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Don't have a token?</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleAuthorizeWithOpenAI()}
                  disabled={authorizingOpenAI}
                >
                  {authorizingOpenAI ? 'Authorizing...' : 'Sign in with OpenAI'}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Opens ChatGPT to authenticate and get access to models.
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
          <IconButton
            icon={<RefreshIcon />}
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className={cn(
              'ml-auto text-muted-foreground hover:text-foreground',
              refreshing && 'animate-spin hover:bg-transparent'
            )}
            title="Refresh models from API"
          />
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
