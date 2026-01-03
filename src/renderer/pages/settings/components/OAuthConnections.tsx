import { useCallback, useEffect, useState } from 'react';
import type { OAuthProviderStatus } from '../../../../shared/types/oauth.types.js';
import { cn } from '../../../lib/utils.js';
import {
  AlertCircleIcon,
  AnthropicIcon,
  Button,
  CheckCircleIcon,
  IconButton,
  LinkIcon,
  OpenAIIcon,
  RefreshIcon,
  Section,
} from '../../../components/ui/index.js';

/**
 * Get icon component for provider
 */
const getProviderIcon = (icon: string): React.JSX.Element => {
  switch (icon) {
    case 'anthropic':
      return <AnthropicIcon />;
    case 'openai':
      return <OpenAIIcon />;
    default:
      return <LinkIcon />;
  }
};

interface ProviderRowProps {
  provider: OAuthProviderStatus;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  isLoading: boolean;
}

/**
 * Single provider row
 */
const ProviderRow = ({
  provider,
  onConnect,
  onDisconnect,
  isLoading,
}: ProviderRowProps): React.JSX.Element => (
  <div className="flex items-center justify-between py-3 border-b border-border last:border-0 w-full">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-foreground">
        {getProviderIcon(provider.icon)}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{provider.name}</span>
        {provider.connected && provider.profile?.email ? (
          <span className="flex items-center gap-1 text-xs text-success">
            <CheckCircleIcon />
            {provider.profile.email}
          </span>
        ) : provider.connected && provider.profile?.name ? (
          <span className="flex items-center gap-1 text-xs text-success">
            <CheckCircleIcon />
            {provider.profile.name}
          </span>
        ) : provider.connected ? (
          <span className="flex items-center gap-1 text-xs text-success">
            <CheckCircleIcon />
            Connected
          </span>
        ) : provider.isExpired ? (
          <span className="flex items-center gap-1 text-xs text-warning">
            <AlertCircleIcon />
            Session expired
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{provider.description}</span>
        )}
      </div>
    </div>
    <div>
      {provider.connected ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onDisconnect(provider.id);
          }}
          disabled={isLoading}
        >
          Disconnect
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            onConnect(provider.id);
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : provider.isExpired ? 'Reconnect' : 'Connect'}
        </Button>
      )}
    </div>
  </div>
);

/**
 * OAuth Connections component - manages external OAuth providers
 */
export const OAuthConnections = (): React.JSX.Element => {
  const [providers, setProviders] = useState<OAuthProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load providers from backend
   */
  const loadProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.agentage.oauth.list();
      setProviders(result.providers);
    } catch (err) {
      console.error('[OAuthConnections] Failed to load providers:', err);
      setError('Failed to load providers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProviders();
  }, [loadProviders]);

  /**
   * Handle connect button click
   */
  const handleConnect = useCallback(
    async (providerId: string) => {
      setActionLoading(providerId);
      setError(null);
      try {
        const result = await window.agentage.oauth.connect(providerId as 'openai' | 'anthropic');
        if (result.success) {
          await loadProviders();
        } else {
          setError(result.error ?? 'Connection failed');
        }
      } catch (err) {
        console.error('[OAuthConnections] Connect error:', err);
        setError('Connection failed');
      } finally {
        setActionLoading(null);
      }
    },
    [loadProviders]
  );

  /**
   * Handle disconnect button click
   */
  const handleDisconnect = useCallback(
    async (providerId: string) => {
      setActionLoading(providerId);
      setError(null);
      try {
        const result = await window.agentage.oauth.disconnect(providerId as 'openai' | 'anthropic');
        if (result.success) {
          await loadProviders();
        } else {
          setError(result.error ?? 'Disconnect failed');
        }
      } catch (err) {
        console.error('[OAuthConnections] Disconnect error:', err);
        setError('Disconnect failed');
      } finally {
        setActionLoading(null);
      }
    },
    [loadProviders]
  );

  return (
    <Section
      icon={<LinkIcon />}
      iconColor="violet"
      title="OAuth Connections"
      description="Connect external AI providers"
      action={
        <IconButton
          icon={<RefreshIcon />}
          onClick={() => void loadProviders()}
          disabled={loading}
          className={cn(loading && 'animate-spin')}
        />
      }
    >
      {error && (
        <div className="mb-3 p-2 rounded bg-destructive/10 text-destructive text-xs flex items-center gap-2">
          <AlertCircleIcon />
          {error}
        </div>
      )}
      {loading && providers.length === 0 ? (
        <div className="py-4 text-center text-muted-foreground text-sm">Loading...</div>
      ) : providers.length === 0 ? (
        <div className="py-4 text-center text-muted-foreground text-sm">
          No OAuth providers available
        </div>
      ) : (
        <div className="divide-y divide-border">
          {providers.map((provider) => (
            <ProviderRow
              key={provider.id}
              provider={provider}
              onConnect={(id) => {
                void handleConnect(id);
              }}
              onDisconnect={(id) => {
                void handleDisconnect(id);
              }}
              isLoading={actionLoading === provider.id}
            />
          ))}
        </div>
      )}
    </Section>
  );
};
