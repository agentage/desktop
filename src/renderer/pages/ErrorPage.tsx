import { useEffect, useState } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { TitleBar } from '../components/TitleBar.js';

/**
 * Error page for routing errors (404, etc.)
 * Shows user-friendly message and auto-redirects to home
 */
export const ErrorPage = (): React.JSX.Element => {
  const error = useRouteError() as Error | { statusText?: string; message?: string };
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
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
    <>
      <TitleBar title="Agentage" showLogo={true} simple={true} />
      <div className="error-page">
        <div className="error-content">
          <div className="error-icon">
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
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>

          <h1 className="error-title">Oops! Page Not Found</h1>

          <p className="error-description">
            The page you&apos;re looking for doesn&apos;t exist or an error occurred.
          </p>

          <p className="error-redirect">
            Redirecting to home page in <strong>{countdown}</strong> second
            {countdown !== 1 ? 's' : ''}
            ...
          </p>

          <button className="error-button" onClick={handleGoHome}>
            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Go Home Now
          </button>

          <div className="error-technical">
            <details>
              <summary>Error details</summary>
              <code>{errorMessage}</code>
            </details>
          </div>
        </div>
      </div>
    </>
  );
};
