import { useAuth } from '../hooks/useAuth.js';

interface HomePageProps {
  onGetStarted: () => void;
}

export const HomePage = ({ onGetStarted }: HomePageProps): React.JSX.Element => {
  const { user, isLoading, login } = useAuth();

  const handleLogin = async (provider: 'google' | 'github' | 'microsoft'): Promise<void> => {
    const result = await login(provider);
    if (result.success) {
      onGetStarted();
    }
  };

  return (
    <div className="start-page">
      <div className="start-page-content">
        {/* Logo / Branding - Matching web Header.tsx Logo component */}
        <div className="start-logo">
          <div className="logo-icon">
            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
          <h1 className="logo-text">Agentage</h1>
          <span className="logo-badge">Desktop</span>
        </div>

        {/* Tagline */}
        <p className="start-tagline">Run, edit, and manage AI agents locally</p>

        {/* Features */}
        <div className="start-features">
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span className="feature-text">Local execution</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔒</span>
            <span className="feature-text">Secure & private</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🌐</span>
            <span className="feature-text">Cross-platform</span>
          </div>
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
              <div className="auth-buttons">
                <button
                  className="start-btn auth google"
                  onClick={() => void handleLogin('google')}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
                <button
                  className="start-btn auth github"
                  onClick={() => void handleLogin('github')}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Continue with GitHub
                </button>
              </div>
              <button className="start-btn skip" onClick={onGetStarted}>
                Continue without signing in
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="start-footer">
          <span className="version">v1.0.0</span>
          <span className="separator">•</span>
          <a href="https://agentage.io" className="link" target="_blank" rel="noreferrer">
            agentage.io
          </a>
        </div>
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
