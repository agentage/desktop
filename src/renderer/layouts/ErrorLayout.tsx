import { useCallback, useEffect, useState } from 'react';
import { TitleBar } from './components/TitleBar.js';

interface ErrorLayoutProps {
  error?: string;
  onRetry?: () => void;
}

// Auto-retry countdown in seconds
const AUTO_RETRY_DELAY = 10;

/**
 * Layout for critical errors (e.g., Electron IPC unavailable)
 *
 * Purpose: Full-screen error display when app cannot initialize
 * Features: Error message, auto-retry countdown, manual retry button, troubleshooting tips
 */
export const ErrorLayout = ({
  error = 'An unexpected error occurred',
  onRetry,
}: ErrorLayoutProps): React.JSX.Element => {
  const [countdown, setCountdown] = useState(AUTO_RETRY_DELAY);

  const handleReload = useCallback((): void => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  }, [onRetry]);

  // Auto-retry countdown
  useEffect(() => {
    if (countdown <= 0) {
      handleReload();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return (): void => {
      clearTimeout(timer);
    };
  }, [countdown, handleReload]);

  return (
    <div className="flex h-screen flex-col bg-background">
      <TitleBar title="Agentage" showLogo={false} simple={true} />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <h1 className="text-2xl font-semibold text-destructive">Unable to Start</h1>
        <p className="text-center text-muted-foreground max-w-md">
          The application failed to initialize properly. This may be a temporary issue.
        </p>
        <p className="text-sm text-muted-foreground">Auto-retrying in {countdown} seconds...</p>
        <div className="rounded-lg bg-card p-4 max-w-md">
          <p className="text-sm font-medium text-foreground mb-2">What you can try:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Reload the application using the button below</li>
            <li>If the problem persists, restart the app completely</li>
            <li>Check if you&apos;re running the desktop app (not in a browser)</li>
          </ul>
        </div>
        <button
          onClick={handleReload}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Reload Application
        </button>
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">Technical details</summary>
          <code className="mt-2 block rounded bg-card p-2 text-destructive">{error}</code>
        </details>
      </div>
    </div>
  );
};
