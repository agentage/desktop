import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { navigationConfig } from '../config/navigation.config.js';
import { useAuth } from '../hooks/useAuth.js';
import { cn } from '../lib/utils.js';

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
  const location = useLocation();

  const handleLogin = async (): Promise<void> => {
    await login();
  };

  const toggleCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavItemClick = (path: string): void => {
    void navigate(path);
  };

  const isActive = (path: string): boolean => location.pathname === path;

  return (
    <aside
      className={cn(
        'flex flex-col bg-sidebar border-r border-sidebar-border',
        'transition-all duration-200',
        isCollapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Header - Title + Collapse Toggle */}
      <div className="flex h-12 items-center justify-between px-3 border-b border-sidebar-border">
        {!isCollapsed && (
          <span className="text-sm font-semibold text-sidebar-foreground">Agentage</span>
        )}
        <button
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md',
            'text-muted-foreground hover:bg-card hover:text-foreground',
            'transition-colors'
          )}
        >
          ☰
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-2">
        {navigationConfig.groups.map((group) => (
          <div key={group.id} className="px-2 py-1">
            {group.label && !isCollapsed && (
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group.label}
              </div>
            )}
            <nav className="flex flex-col gap-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavItemClick(item.path);
                  }}
                  disabled={item.disabled}
                  title={isCollapsed ? item.title : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-2 text-sm',
                    'transition-colors',
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-card',
                    item.disabled && 'opacity-50 cursor-not-allowed',
                    isCollapsed && 'justify-center'
                  )}
                >
                  {!isCollapsed && item.title}
                  {item.badge !== undefined && item.badge > 0 && !isCollapsed && (
                    <span className="ml-auto rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer - Settings, Help, User */}
      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-1">
          <button
            title="Settings"
            onClick={() => void navigate('/settings')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md',
              'text-muted-foreground hover:bg-card hover:text-foreground',
              'transition-colors'
            )}
          >
            ⚙
          </button>
          <button
            title="Help"
            onClick={() => void navigate('/help')}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md',
              'text-muted-foreground hover:bg-card hover:text-foreground',
              'transition-colors'
            )}
          >
            ?
          </button>

          {/* User Profile / Login */}
          <div className="ml-auto">
            {isLoading ? (
              <span className="text-muted-foreground text-sm">...</span>
            ) : user ? (
              <button
                onClick={() => void navigate('/account')}
                title={`${user.name ?? user.email} - Account settings`}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  'bg-primary text-primary-foreground text-sm font-medium',
                  'hover:opacity-90 transition-opacity'
                )}
              >
                {(user.name ?? user.email).charAt(0).toUpperCase()}
              </button>
            ) : (
              <button
                onClick={() => void handleLogin()}
                title="Sign in"
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md',
                  'text-muted-foreground hover:bg-card hover:text-foreground',
                  'transition-colors'
                )}
              >
                👤
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
