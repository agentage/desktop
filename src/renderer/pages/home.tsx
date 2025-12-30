import { BotIcon, CheckCircleIcon, StatCard } from '../components/ui/index.js';

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
        iconColor="blue"
        title="Active Agents"
        value={12}
        trend={{ value: '+25%', up: true }}
        description="Running agents this period"
      />
      <StatCard
        icon={<CheckCircleIcon />}
        iconColor="green"
        title="Tasks Completed"
        value={847}
        trend={{ value: '+12%', up: true }}
        description="Total tasks processed"
      />
    </div>
  </div>
);
