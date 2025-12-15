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

export const AccountsSection = ({
  connectedAccounts = [],
  onLink,
  onUnlink,
}: AccountsSectionProps): React.JSX.Element => {
  const [loading, setLoading] = useState<string | null>(null);

  const providers = [
    { id: 'github', name: 'GitHub', icon: '🔗' },
    { id: 'google', name: 'Google', icon: '🔗' },
    { id: 'microsoft', name: 'Microsoft', icon: '🔗' },
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
      <div className="accounts-list">
        {providers.map((provider) => {
          const connected = isConnected(provider.id);
          const isLoading = loading === provider.id;

          return (
            <div key={provider.id} className="account-item">
              <div className="account-item-info">
                <div className="account-item-icon">{provider.icon}</div>
                <div className="account-item-details">
                  <div className="account-item-name">{provider.name}</div>
                  {connected ? (
                    <div className="account-item-email">{connected.email}</div>
                  ) : (
                    <div className="account-item-status">Not connected</div>
                  )}
                </div>
              </div>
              {connected ? (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    void handleUnlink(provider.id);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Unlinking...' : 'Unlink'}
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    void handleLink(provider.id);
                  }}
                  disabled={isLoading}
                >
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
