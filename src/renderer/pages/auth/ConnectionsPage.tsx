/**
 * ConnectionsPage - OAuth provider connections
 *
 * Purpose: Connect and manage external AI provider OAuth connections
 * Features: Connect/disconnect providers, view connection status
 */
import { OAuthConnections } from '../settings/components/OAuthConnections.js';
import { LinkIcon } from '../../components/index.js';

export const ConnectionsPage = (): React.JSX.Element => (
  <div className="flex-1 p-4 h-full">
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-primary/10">
          <LinkIcon />
        </div>
        <h1 className="text-base font-semibold text-foreground">Connections</h1>
      </div>
      <OAuthConnections />
    </div>
  </div>
);
