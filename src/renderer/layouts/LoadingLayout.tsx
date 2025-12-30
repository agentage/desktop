import { TitleBar } from '../components/TitleBar.js';

interface LoadingLayoutProps {
  message?: string;
}

/**
 * Layout for loading states (app initialization, auth checks, etc.)
 *
 * Purpose: Full-screen loading display while app initializes
 * Features: App branding, loading spinner, status message
 */
export const LoadingLayout = ({
  message = 'Loading...',
}: LoadingLayoutProps): React.JSX.Element => (
  <div className="flex h-screen flex-col bg-background">
    <TitleBar title="Agentage" showLogo={false} simple={true} />
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold text-primary">Agentage</h1>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);
