import type { ToolSource, ToolStatus } from '../../../../shared/types/index.js';
import { cn } from '../../../lib/utils.js';
import { Badge, Switch } from '../../ui/index.js';

export interface ToolCardProps {
  name: string;
  description: string;
  source: ToolSource;
  status: ToolStatus;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

/**
 * Status indicator component
 */
const StatusIndicator = ({ status }: { status: ToolStatus }): React.JSX.Element => {
  const statusConfig: Record<ToolStatus, { emoji: string; label: string }> = {
    ready: { emoji: '🟢', label: 'Ready' },
    warning: { emoji: '⚠️', label: 'Warning' },
    error: { emoji: '🔴', label: 'Error' },
  };

  const config = statusConfig[status];

  return (
    <span title={config.label} className="text-sm">
      {config.emoji}
    </span>
  );
};

/**
 * Source badge component
 */
const SourceBadge = ({ source }: { source: ToolSource }): React.JSX.Element => {
  const variantMap: Record<ToolSource, 'secondary' | 'outline'> = {
    builtin: 'secondary',
    global: 'outline',
    workspace: 'outline',
  };

  return <Badge variant={variantMap[source]}>{source}</Badge>;
};

/**
 * ToolCard - Individual tool display component
 *
 * Displays tool information with enable/disable toggle.
 *
 * @example
 * <ToolCard
 *   name="search_github"
 *   description="Search GitHub repositories by query"
 *   source="builtin"
 *   status="ready"
 *   enabled={true}
 *   onToggle={(enabled) => handleToggle(enabled)}
 * />
 */
export const ToolCard = ({
  name,
  description,
  source,
  status,
  enabled,
  onToggle,
}: ToolCardProps): React.JSX.Element => (
  <div
    className={cn(
      'flex flex-col gap-2 p-4 rounded-lg border border-border bg-card',
      'hover:border-primary/30 transition-colors'
    )}
  >
    {/* Header: Checkbox + Name */}
    <div className="flex items-center gap-3">
      <Switch checked={enabled} onCheckedChange={onToggle} aria-label={`Enable ${name}`} />
      <span className="font-mono text-sm font-medium text-foreground">{name}</span>
    </div>

    {/* Description */}
    <p className="text-sm text-muted-foreground pl-12">{description}</p>

    {/* Footer: Source badge + Status */}
    <div className="flex items-center justify-end gap-2 pl-12">
      <SourceBadge source={source} />
      <span className="text-muted-foreground">•</span>
      <StatusIndicator status={status} />
    </div>
  </div>
);
