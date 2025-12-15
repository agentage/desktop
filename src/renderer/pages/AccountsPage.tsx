import { useEffect, useState } from 'react';
import { AccountsSection } from '../components/features/settings/index.js';
import '../styles/settings.css';

/**
 * Accounts page - manage connected third-party accounts
 * Route: /accounts
 * Content only - rendered inside AppLayout
 */
export const AccountsPage = (): React.JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [connectedAccounts, setConnectedAccounts] = useState<
    {
      provider: 'github' | 'google' | 'microsoft';
      email: string;
      connectedAt: string;
    }[]
  >([]);

  useEffect(() => {
    // Load connected accounts from storage
    void loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async (): Promise<void> => {
    try {
      // TODO: Implement actual API call to load connected accounts
      // For now, simulate loading
      await new Promise((resolve) => setTimeout(resolve, 500));
      setConnectedAccounts([]);
    } catch (error) {
      console.error('Failed to load connected accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (provider: string): Promise<void> => {
    // TODO: Implement OAuth flow for linking account
    console.log(`Link ${provider} account`);

    // Simulate linking
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Add to connected accounts (mock)
    setConnectedAccounts([
      ...connectedAccounts,
      {
        provider: provider as 'github' | 'google' | 'microsoft',
        email: `user@${provider}.com`,
        connectedAt: new Date().toISOString(),
      },
    ]);
  };

  const handleUnlink = async (provider: string): Promise<void> => {
    // TODO: Implement account unlinking
    console.log(`Unlink ${provider} account`);

    // Simulate unlinking
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Remove from connected accounts
    setConnectedAccounts(connectedAccounts.filter((acc) => acc.provider !== provider));
  };

  if (loading) {
    return (
      <div className="settings-page loading">
        <div className="settings-loading">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-content">
        <AccountsSection
          connectedAccounts={connectedAccounts}
          onLink={handleLink}
          onUnlink={handleUnlink}
        />
      </div>
    </div>
  );
};
