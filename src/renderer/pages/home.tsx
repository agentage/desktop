import { cn } from '../lib/utils.js';

// Icons
const TrendingUpIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 6l-9.5 9.5-5-5L1 18" />
    <path d="M17 6h6v6" />
  </svg>
);

const BotIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

const CheckCircleIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/** Reusable stat card section - matches settings page styling */
interface StatCardProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  description: string;
}

const StatCard = ({
  icon,
  iconColor,
  title,
  value,
  trend,
  trendUp = true,
  description,
}: StatCardProps): React.JSX.Element => (
  <div className="rounded-lg border border-border bg-sidebar p-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={cn('flex size-8 items-center justify-center rounded-md', iconColor)}>
          {icon}
        </div>
        <div className="text-xs text-muted-foreground">{title}</div>
      </div>
      {trend && (
        <div
          className={cn(
            'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium',
            'border border-border bg-muted/30',
            trendUp ? 'text-success' : 'text-destructive'
          )}
        >
          <TrendingUpIcon />
          <span>{trend}</span>
        </div>
      )}
    </div>
    <div className="space-y-2">
      <div className="text-2xl font-semibold tabular-nums text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </div>
  </div>
);

/**
 * Home page - Dashboard overview with stats
 * Route: /
 *
 * Purpose: Landing page after login with key metrics
 * Features: Stat cards with consistent styling
 */
export const HomePage = (): React.JSX.Element => (
  <div className="flex flex-col gap-4 p-4">
    {/* Stat Cards */}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <StatCard
        icon={<BotIcon />}
        iconColor="bg-blue-500/10 text-blue-500"
        title="Active Agents"
        value={12}
        trend="+25%"
        trendUp={true}
        description="Running agents this period"
      />
      <StatCard
        icon={<CheckCircleIcon />}
        iconColor="bg-green-500/10 text-green-500"
        title="Tasks Completed"
        value={847}
        trend="+12%"
        trendUp={true}
        description="Total tasks processed"
      />
    </div>
  </div>
);
