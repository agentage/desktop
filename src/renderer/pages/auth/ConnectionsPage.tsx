/**
 * ConnectionsPage - OAuth provider connections
 *
 * Purpose: Connect and manage external AI provider OAuth connections
 * Features: Connect/disconnect providers, view connection status
 */
import { useCallback, useState } from 'react';
import { IconButton, LinkIcon, RefreshIcon } from '../../components/index.js';
import { cn } from '../../lib/utils.js';
import { OAuthConnections } from '../settings/components/OAuthConnections.js';

export const ConnectionsPage = (): React.JSX.Element => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      await window.agentage.oauth.list();
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <div className="flex-1 p-4 h-full">
      <div className="w-full space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <LinkIcon />
          </div>
          <h1 className="text-base font-semibold text-foreground">Connections</h1>
          <IconButton
            icon={<RefreshIcon />}
            onClick={() => void handleRefresh()}
            disabled={refreshing}
            className={cn(
              'ml-auto text-muted-foreground hover:text-foreground',
              refreshing && 'animate-spin hover:bg-transparent'
            )}
            title="Refresh connections"
          />
        </div>
        <OAuthConnections />
      </div>
    </div>
  );
};
