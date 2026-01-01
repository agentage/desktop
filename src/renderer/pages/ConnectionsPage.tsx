/**
 * ConnectionsPage - OAuth provider connections
 *
 * Purpose: Connect and manage external AI provider OAuth connections
 * Features: Connect/disconnect providers, view connection status
 */
import { OAuthConnections } from '../components/OAuthConnections.js';
import { LinkIcon } from '../components/ui/index.js';

export const ConnectionsPage = (): React.JSX.Element => (
  <div className="flex-1 p-6 h-full">
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <LinkIcon />
        </div>
        <h1 className="text-lg font-semibold text-foreground">Connections</h1>
      </div>
      <OAuthConnections />
    </div>
  </div>
);
