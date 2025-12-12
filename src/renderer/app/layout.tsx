import { ReactNode } from 'react';
import { AgentList } from '../components/features/agents/index.js';
import { TitleBar } from '../components/index.js';
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
      <TitleBar title="Agentage" showLogo={true} />

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
