import { useState } from 'react';
import { SettingsSection } from './SettingsSection.js';

interface ConnectedAccount {
  provider: 'github' | 'google' | 'microsoft';
  email: string;
  connectedAt: string;
}

interface AccountsSectionProps {
  connectedAccounts?: ConnectedAccount[];
  onLink?: (provider: string) => Promise<void>;
  onUnlink?: (provider: string) => Promise<void>;
}

/**
 * Connected accounts settings section
 * 
 * Purpose: Manage third-party account connections
 * Features: List providers, link/unlink buttons, connection status
 */
export const AccountsSection = ({
  connectedAccounts = [],
  onLink,
  onUnlink,
}: AccountsSectionProps): React.JSX.Element => {
  const [loading, setLoading] = useState<string | null>(null);

  const providers = [
    { id: 'github', name: 'GitHub' },
    { id: 'google', name: 'Google' },
    { id: 'microsoft', name: 'Microsoft' },
  ];

  const handleLink = async (provider: string): Promise<void> => {
    if (!onLink) return;
    setLoading(provider);
    try {
      await onLink(provider);
    } catch (error) {
      console.error(`Failed to link ${provider}:`, error);
    } finally {
      setLoading(null);
    }
  };

  const handleUnlink = async (provider: string): Promise<void> => {
    if (!onUnlink) return;
    setLoading(provider);
    try {
      await onUnlink(provider);
    } catch (error) {
      console.error(`Failed to unlink ${provider}:`, error);
    } finally {
      setLoading(null);
    }
  };

  const isConnected = (providerId: string): ConnectedAccount | undefined =>
    connectedAccounts.find((acc) => acc.provider === providerId);

  return (
    <SettingsSection title="Connected Accounts">
      <div>
        {providers.map((provider) => {
          const connected = isConnected(provider.id);
          const isLoading = loading === provider.id;

          return (
            <div key={provider.id}>
              <div>
                <div>{provider.name}</div>
                {connected ? (
                  <div>{connected.email}</div>
                ) : (
                  <div>Not connected</div>
                )}
              </div>
              {connected ? (
                <button onClick={() => void handleUnlink(provider.id)} disabled={isLoading}>
                  {isLoading ? 'Unlinking...' : 'Unlink'}
                </button>
              ) : (
                <button onClick={() => void handleLink(provider.id)} disabled={isLoading}>
                  {isLoading ? 'Linking...' : 'Link'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </SettingsSection>
  );
};
