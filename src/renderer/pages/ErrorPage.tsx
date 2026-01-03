import { useEffect, useState } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { TitleBar } from '../layouts/components/TitleBar.js';

/**
 * Error page for routing errors (404, etc.)
 *
 * Purpose: Display user-friendly error message for navigation errors
 * Features: Error display, auto-redirect countdown, manual home button
 */
export const ErrorPage = (): React.JSX.Element => {
  const error = useRouteError() as Error | { statusText?: string; message?: string };
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return (): void => {
      clearInterval(timer);
    };
  }, [navigate]);

  const handleGoHome = (): void => {
    void navigate('/');
  };

  const errorMessage =
    'statusText' in error ? error.statusText : 'message' in error ? error.message : 'Unknown error';

  return (
    <div>
      <TitleBar title="Agentage" showLogo={true} simple={true} />
      <div>
        <h1>Oops! Page Not Found</h1>
        <p>The page you&apos;re looking for doesn&apos;t exist or an error occurred.</p>
        <p>
          Redirecting to home page in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>
        <button onClick={handleGoHome}>Go Home Now</button>
        <details>
          <summary>Error details</summary>
          <code>{errorMessage}</code>
        </details>
      </div>
    </div>
  );
};
