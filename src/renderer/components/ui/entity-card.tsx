import { cn } from '../../lib/utils.js';

// ============================================================================
// EntityCard Component
// ============================================================================

export interface EntityBadge {
  /** Badge label */
  label: string;
  /** Badge variant */
  variant: 'primary' | 'muted' | 'success' | 'warning';
}

export interface EntityCardProps {
  /** Icon element to display */
  icon: React.ReactNode;
  /** Entity title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Whether the entity is active/selected */
  isActive?: boolean;
  /** Badges to display */
  badges?: EntityBadge[];
  /** Action buttons */
  actions?: React.ReactNode;
  /** Click handler for the card (excluding actions) */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const badgeVariants: Record<EntityBadge['variant'], string> = {
  primary: 'bg-primary/10 text-primary',
  muted: 'bg-muted text-muted-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-destructive/10 text-destructive',
};

/**
 * EntityCard - Card for list items
 *
 * Used for workspaces, agents, tools, etc.
 *
 * @example
 * <EntityCard
 *   icon={<WorkspaceIcon />}
 *   title={workspace.name}
 *   subtitle={workspace.path}
 *   isActive={workspace.id === activeId}
 *   badges={[{ label: 'Active', variant: 'primary' }]}
 *   actions={
 *     <>
 *       <IconButton icon={<EditIcon />} onClick={handleEdit} />
 *       <IconButton icon={<TrashIcon />} variant="destructive" onClick={handleRemove} />
 *     </>
 *   }
 * />
 */
export const EntityCard = ({
  icon,
  title,
  subtitle,
  isActive,
  badges,
  actions,
  onClick,
  className,
}: EntityCardProps): React.JSX.Element => {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={cn(
        'rounded-lg border bg-sidebar p-4 transition-colors',
        isActive ? 'border-primary' : 'border-border hover:border-muted-foreground/50',
        isClickable && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex size-10 items-center justify-center rounded-md bg-muted shrink-0">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-medium text-foreground truncate">{title}</h3>
            {badges?.map((badge, index) => (
              <span
                key={index}
                className={cn(
                  'px-1.5 py-0.5 text-[10px] font-medium rounded',
                  badgeVariants[badge.variant]
                )}
              >
                {badge.label}
              </span>
            ))}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground truncate" title={subtitle}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
