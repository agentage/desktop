import type { ToolSource, ToolStatus } from '../../../../shared/types/index.js';
import { cn } from '../../../lib/utils.js';
import { Switch } from '../../../components/ui/index.js';

export interface ToolCardProps {
  name: string;
  description: string;
  source: ToolSource;
  status: ToolStatus;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

/**
 * Status indicator - compact dot
 */
const StatusDot = ({ status }: { status: ToolStatus }): React.JSX.Element => {
  const statusConfig: Record<ToolStatus, { color: string; label: string }> = {
    ready: { color: 'bg-success', label: 'Ready' },
    warning: { color: 'bg-warning', label: 'Warning' },
    error: { color: 'bg-destructive', label: 'Error' },
  };

  const config = statusConfig[status];

  return <span title={config.label} className={cn('w-2 h-2 rounded-full', config.color)} />;
};

/**
 * ToolCard - Compact single-row tool display
 *
 * Optimized for lists with 200+ tools.
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
      'flex items-center gap-3 px-3 py-2 rounded-md border border-border bg-card',
      'hover:border-primary/30 transition-colors group'
    )}
  >
    <Switch
      checked={enabled}
      onCheckedChange={onToggle}
      aria-label={`Enable ${name}`}
      className="shrink-0"
    />
    <StatusDot status={status} />
    <span className="font-mono text-xs font-medium text-foreground shrink-0">{name}</span>
    <span className="text-xs text-muted-foreground truncate flex-1" title={description}>
      {description}
    </span>
    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider shrink-0">
      {source}
    </span>
  </div>
);
