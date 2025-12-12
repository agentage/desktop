import { TitleBar } from '../components/index.js';
import { useAuth } from '../hooks/useAuth.js';

interface HomePageProps {
  onGetStarted: () => void;
}

export const HomePage = ({ onGetStarted }: HomePageProps): React.JSX.Element => {
  const { user, isLoading, login } = useAuth();

  const handleLogin = async (): Promise<void> => {
    // Provider selection happens on the web page, not in desktop app
    const result = await login();
    if (result.success) {
      onGetStarted();
    }
  };

  return (
    <div className="start-page">
      {/* Custom titlebar (dark variant for start page) */}
      <div className="start-page-titlebar">
        <TitleBar title="Agentage" showLogo={false} dark={true} />
      </div>
      <div className="start-page-content">
        {/* Logo / Branding - Matching web Header.tsx Logo component */}
        <div className="start-logo">
          <div className="logo-icon">
            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
          <h1 className="logo-text">Agentage</h1>
        </div>

        {/* Actions */}
        <div className="start-actions">
          {isLoading ? (
            <div className="start-loading">
              <div className="spinner" />
              <span>Loading...</span>
            </div>
          ) : user ? (
            <>
              <p className="welcome-back">Welcome back, {user.name ?? user.email}!</p>
              <button className="start-btn primary" onClick={onGetStarted}>
                Get Started
              </button>
            </>
          ) : (
            <>
              <p className="start-prompt">Sign in to sync agents and settings</p>
              <button className="start-btn primary" onClick={() => void handleLogin()}>
                Sign in to Agentage
              </button>
              <button className="start-btn skip" onClick={onGetStarted}>
                Continue without signing in
              </button>
            </>
          )}
        </div>

        {/* Tagline & Features */}
        <div className="start-info">
          <div className="start-features">
            <div className="feature">
              <svg
                className="feature-icon feature-icon--discover"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <span className="feature-text">Discover</span>
            </div>
            <div className="feature">
              <svg
                className="feature-icon feature-icon--run"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.69L9.54 5.98A.998.998 0 0 0 8 6.82z" />
              </svg>
              <span className="feature-text">Run</span>
            </div>
            <div className="feature">
              <svg
                className="feature-icon feature-icon--share"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
              </svg>
              <span className="feature-text">Share</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - positioned bottom right */}
      <div className="start-footer">
        <span className="version">v1.0.0</span>
        <span className="separator">•</span>
        <button
          className="link"
          onClick={() => void window.agentage.app.openExternal('https://dev.agentage.io')}
        >
          agentage.io
        </button>
      </div>

      {/* Background decoration */}
      <div className="start-bg-decoration">
        <div className="glow glow-1" />
        <div className="glow glow-2" />
        <div className="grid-pattern" />
      </div>
    </div>
  );
};
