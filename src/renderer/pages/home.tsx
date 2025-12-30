import {
  Badge,
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/index.js';

// Simple trend icon
const TrendingUp = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 6l-9.5 9.5-5-5L1 18" />
    <path d="M17 6h6v6" />
  </svg>
);

/**
 * Home page - Dashboard overview with stats
 * Route: /
 *
 * Purpose: Landing page after login with key metrics
 * Features: Breadcrumbs, stat cards
 */
export const HomePage = (): React.JSX.Element => (
  <div className="flex flex-col gap-6">
    {/* Stat Cards */}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardDescription>Active Agents</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl">12</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +25%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter>
          <div className="flex gap-2 text-sm font-medium">
            Trending up this month <TrendingUp />
          </div>
          <div className="text-muted-foreground text-sm">Running agents this period</div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Tasks Completed</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums md:text-3xl">847</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +12%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter>
          <div className="flex gap-2 text-sm font-medium">
            Strong performance <TrendingUp />
          </div>
          <div className="text-muted-foreground text-sm">Total tasks processed</div>
        </CardFooter>
      </Card>
    </div>
  </div>
);
