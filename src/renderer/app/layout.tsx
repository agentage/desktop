import { ReactNode } from 'react';
import { AgentList } from '../components/features/agents/index.js';
import { useAuth } from '../hooks/useAuth.js';

interface AppLayoutProps {
  children: ReactNode;
  selectedAgent: string | null;
  onSelectAgent: (name: string) => void;
}

export const AppLayout = ({
  children,
  selectedAgent,
  onSelectAgent,
}: AppLayoutProps): React.JSX.Element => {
  const { user, isLoading, login, logout } = useAuth();

  const handleLogin = async (): Promise<void> => {
    // Provider selection happens on the web page, not in desktop app
    await login();
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">
            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
          <div className="app-logo-text">
            <span className="app-title">Agentage</span>
            <span className="app-version">Desktop</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <AgentList onSelect={onSelectAgent} selectedAgent={selectedAgent} />

          <div className="sidebar-footer">
            {isLoading ? (
              <div className="login-loading">Loading...</div>
            ) : user ? (
              <div className="user-info">
                <div className="user-details">
                  <span className="user-name">{user.name ?? user.email}</span>
                  <span className="user-email">{user.email}</span>
                </div>
                <button className="logout-btn" onClick={() => void logout()}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="login-buttons">
                <button className="login-btn primary" onClick={() => void handleLogin()}>
                  Sign In
                </button>
              </div>
            )}
          </div>
        </aside>

        <section className="content">{children}</section>
      </main>
    </div>
  );
};
