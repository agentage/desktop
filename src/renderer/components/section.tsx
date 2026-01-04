import { cn } from '../lib/utils.js';
import { IconContainer, type IconContainerColor, TrendingUpIcon } from '../../shared/index.js';

// ============================================================================
// Section Component
// ============================================================================

export interface SectionProps {
  /** Icon element to display */
  icon: React.ReactNode;
  /** Color variant for the icon container */
  iconColor: IconContainerColor;
  /** Section title */
  title: string;
  /** Optional description below title */
  description?: string;
  /** Optional action element (button, link, etc.) */
  action?: React.ReactNode;
  /** Section content */
  children: React.ReactNode;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Section - Card container with icon header
 *
 * Used for settings, account, and content pages.
 *
 * @example
 * <Section
 *   icon={<UserIcon />}
 *   iconColor="blue"
 *   title="Profile"
 *   description="Your account information"
 *   action={<Button variant="ghost" size="sm">Edit</Button>}
 * >
 *   {children}
 * </Section>
 */
export const Section = ({
  icon,
  iconColor,
  title,
  description,
  action,
  children,
  className,
}: SectionProps): React.JSX.Element => (
  <div className={cn('rounded-lg border border-border bg-sidebar p-4', className)}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <IconContainer color={iconColor}>{icon}</IconContainer>
        <div>
          <div className="text-sm font-medium text-foreground">{title}</div>
          {description && <div className="text-xs text-muted-foreground">{description}</div>}
        </div>
      </div>
      {action}
    </div>
    {children}
  </div>
);

// ============================================================================
// StatCard Component
// ============================================================================

export interface StatCardTrend {
  /** Trend value (e.g., "+25%") */
  value: string;
  /** Whether the trend is positive */
  up: boolean;
}

export interface StatCardProps {
  /** Icon element to display */
  icon: React.ReactNode;
  /** Color variant for the icon container */
  iconColor: IconContainerColor;
  /** Stat title/label */
  title: string;
  /** Stat value */
  value: string | number;
  /** Optional trend indicator */
  trend?: StatCardTrend;
  /** Optional description */
  description?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * StatCard - Dashboard stat display card
 *
 * Shows numeric stats with icon, optional trend, and description.
 *
 * @example
 * <StatCard
 *   icon={<BotIcon />}
 *   iconColor="blue"
 *   title="Active Agents"
 *   value={12}
 *   trend={{ value: "+25%", up: true }}
 *   description="Running agents this period"
 * />
 */
export const StatCard = ({
  icon,
  iconColor,
  title,
  value,
  trend,
  description,
  className,
}: StatCardProps): React.JSX.Element => (
  <div className={cn('rounded-lg border border-border bg-sidebar p-4', className)}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <IconContainer color={iconColor}>{icon}</IconContainer>
        <div className="text-xs text-muted-foreground">{title}</div>
      </div>
      {trend && (
        <div
          className={cn(
            'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium',
            'border border-border bg-muted/30',
            trend.up ? 'text-success' : 'text-destructive'
          )}
        >
          <TrendingUpIcon />
          <span>{trend.value}</span>
        </div>
      )}
    </div>
    <div className="space-y-2">
      <div className="text-2xl font-semibold tabular-nums text-foreground">{value}</div>
      {description && <div className="text-xs text-muted-foreground">{description}</div>}
    </div>
  </div>
);
