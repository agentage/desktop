import { TitleBar } from '../components/TitleBar.js';

interface ErrorLayoutProps {
  error?: string;
  onRetry?: () => void;
}

/**
 * Layout for critical errors (e.g., Electron IPC unavailable)
 *
 * Purpose: Full-screen error display when app cannot initialize
 * Features: Error message, retry button, troubleshooting tips
 */
export const ErrorLayout = ({
  error = 'An unexpected error occurred',
  onRetry,
}: ErrorLayoutProps): React.JSX.Element => {
  const handleReload = (): void => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div>
      <TitleBar title="Agentage" showLogo={false} simple={true} />
      <div>
        <h1>Unable to Start</h1>
        <p>The application failed to initialize properly. This may be a temporary issue.</p>
        <div>
          <p>What you can try:</p>
          <ul>
            <li>Reload the application using the button below</li>
            <li>If the problem persists, restart the app completely</li>
            <li>Check if you&apos;re running the desktop app (not in a browser)</li>
          </ul>
        </div>
        <button onClick={handleReload}>Reload Application</button>
        <details>
          <summary>Technical details</summary>
          <code>{error}</code>
        </details>
      </div>
    </div>
  );
};
