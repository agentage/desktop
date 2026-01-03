import { TitleBar } from '../components/layout/TitleBar.js';

// Loader icon (Lucide loader-2)
const LoaderIcon = (): React.JSX.Element => (
  <svg
    className="h-8 w-8 animate-spin text-primary"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

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
      <LoaderIcon />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);
