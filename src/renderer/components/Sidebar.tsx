import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigationConfig } from '../config/navigation.config.js';
import { useAuth } from '../hooks/useAuth.js';

/**
 * Left sidebar navigation component
 *
 * Purpose: Main navigation for the application
 * Features:
 *   - Collapsible sidebar with hamburger toggle
 *   - Navigation groups from config
 *   - User section at bottom (login/profile)
 *   - Settings and Help quick access
 */
export const Sidebar = (): React.JSX.Element => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (): Promise<void> => {
    await login();
  };

  const toggleCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavItemClick = (path: string): void => {
    void navigate(path);
  };

  return (
    <aside>
      {/* Header - Title + Collapse Toggle */}
      <div>
        {!isCollapsed && <span>Agentage</span>}
        <button
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          ☰
        </button>
      </div>

      {/* Navigation Groups */}
      {navigationConfig.groups.map((group) => (
        <div key={group.id}>
          {group.label && !isCollapsed && <div>{group.label}</div>}
          <nav>
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  handleNavItemClick(item.path);
                }}
                disabled={item.disabled}
                title={isCollapsed ? item.title : undefined}
              >
                {!isCollapsed && item.title}
                {item.badge !== undefined && item.badge > 0 && !isCollapsed && (
                  <span>{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      ))}

      {/* Spacer */}
      <div />

      {/* Footer - Settings, Help, User */}
      <div>
        <div>
          <button title="Settings" onClick={() => void navigate('/settings')}>
            ⚙
          </button>
          <button title="Help" onClick={() => void navigate('/help')}>
            ?
          </button>

          {/* User Profile / Login */}
          {isLoading ? (
            <span>...</span>
          ) : user ? (
            <button
              onClick={() => void navigate('/account')}
              title={`${user.name ?? user.email} - Account settings`}
            >
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </button>
          ) : (
            <button onClick={() => void handleLogin()} title="Sign in">
              👤
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
