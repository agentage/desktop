import { TitleBar } from './TitleBar.js';

interface ElectronErrorScreenProps {
  error: string;
  onRetry?: () => void;
}

/**
 * Full-screen error display when Electron IPC is not available
 */
export const ElectronErrorScreen = ({
  error,
  onRetry,
}: ElectronErrorScreenProps): React.JSX.Element => {
  const handleReload = (): void => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="electron-error-screen">
      <TitleBar title="Agentage" showLogo={false} simple={true} />
      <div className="electron-error-content">
        <div className="electron-error-icon">
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="electron-error-title">Unable to Start</h1>

        <p className="electron-error-description">
          The application failed to initialize properly. This may be a temporary issue.
        </p>

        <div className="electron-error-details">
          <p className="details-title">What you can try:</p>
          <ul>
            <li>Reload the application using the button below</li>
            <li>If the problem persists, restart the app completely</li>
            <li>Check if you&apos;re running the desktop app (not in a browser)</li>
          </ul>
        </div>

        <button className="electron-error-retry" onClick={handleReload}>
          <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path
              clipRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              fillRule="evenodd"
            />
          </svg>
          Reload Application
        </button>

        <p className="electron-error-technical">
          <details>
            <summary>Technical details</summary>
            <code>{error}</code>
          </details>
        </p>
      </div>
    </div>
  );
};
