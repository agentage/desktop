import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { navigationConfig } from '../config/navigation.config.js';
import { useAuth } from '../hooks/useAuth.js';

/**
 * Left sidebar navigation component - Uxcel-style design
 * Collapsible with hamburger menu for mobile/compact mode
 * Contains: configurable navigation groups and user section at bottom
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

  const renderIcon = (iconName: string): React.ReactNode => {
    const iconMap: Record<string, React.ReactNode> = {
      home: <HomeIcon />,
      bot: <BotIcon />,
      'list-checks': <TasksIcon />,
      workflow: <WorkflowIcon />,
      'file-stack': <FileStackIcon />,
      brain: <BrainIcon />,
      wrench: <WrenchIcon />,
      key: <KeyIcon />,
      'file-text': <FileTextIcon />,
      'circle-help': <HelpIcon />,
      link: <LinkIcon />,
    };
    return iconMap[iconName] ?? <DefaultIcon />;
  };

  return (
    <aside className={`manus-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header - Title + Collapse Toggle */}
      <div className="sidebar-header">
        {!isCollapsed && <span className="sidebar-title">Agentage</span>}
        <button
          className="sidebar-toggle"
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeftIcon />
        </button>
      </div>

      {/* Navigation Groups */}
      {navigationConfig.groups.map((group) => (
        <div key={group.id} className="sidebar-section">
          {group.label && !isCollapsed && (
            <div className="sidebar-section-header">
              <span>{group.label}</span>
            </div>
          )}
          <nav className="sidebar-nav">
            {group.items.map((item) => (
              <NavItem
                key={item.id}
                icon={renderIcon(item.icon)}
                label={item.title}
                onClick={() => {
                  handleNavItemClick(item.path);
                }}
                isActive={location.pathname === item.path}
                collapsed={isCollapsed}
                disabled={item.disabled}
                badge={item.badge}
              />
            ))}
          </nav>
        </div>
      ))}

      {/* Spacer */}
      <div className="sidebar-spacer" />

      {/* Footer - Settings, Help, User */}
      <div className="sidebar-footer-section">
        {/* Footer Actions */}
        <div className={`sidebar-footer-actions ${isCollapsed ? 'collapsed' : ''}`}>
          <button
            className="sidebar-footer-btn"
            title="Settings"
            onClick={() => {
              void navigate('/settings');
            }}
          >
            <SettingsIcon />
          </button>
          <button
            className="sidebar-footer-btn"
            title="Help"
            onClick={() => {
              void navigate('/help');
            }}
          >
            <HelpIcon />
          </button>

          {/* User Profile / Login */}
          {isLoading ? (
            <div className="sidebar-user-loading">...</div>
          ) : user ? (
            <button
              className="sidebar-user-btn"
              onClick={() => {
                void navigate('/account');
              }}
              title={`${user.name ?? user.email} - Account settings`}
            >
              <UserAvatar name={user.name ?? user.email} />
            </button>
          ) : (
            <button
              className="sidebar-login-btn"
              onClick={() => {
                void handleLogin();
              }}
              title="Sign in"
            >
              <UserIcon />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

/* ============================================
   Sub-components
   ============================================ */

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  hasDropdown?: boolean;
  collapsed?: boolean;
  disabled?: boolean;
  badge?: number;
}

const NavItem = ({
  icon,
  label,
  onClick,
  isActive = false,
  hasDropdown = false,
  collapsed = false,
  disabled = false,
  badge,
}: NavItemProps): React.JSX.Element => (
  <button
    className={`sidebar-nav-item ${isActive ? 'active' : ''} ${collapsed ? 'collapsed' : ''} ${disabled ? 'disabled' : ''}`}
    onClick={onClick}
    title={collapsed ? label : undefined}
    disabled={disabled}
  >
    <span className="nav-item-icon">{icon}</span>
    {!collapsed && <span className="nav-item-label">{label}</span>}
    {badge !== undefined && badge > 0 && !collapsed && (
      <span className="nav-item-badge">{badge}</span>
    )}
    {hasDropdown && !collapsed && (
      <span className="nav-item-dropdown">
        <ChevronDownIcon />
      </span>
    )}
  </button>
);

interface UserAvatarProps {
  name: string;
}

const UserAvatar = ({ name }: UserAvatarProps): React.JSX.Element => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return <div className="sidebar-avatar">{initials}</div>;
};

/* ============================================
   Icons (SVG)
   ============================================ */

// Panel-left icon from Lucide - matches sidebar toggle design
const PanelLeftIcon = (): React.JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M9 3v18" />
  </svg>
);

const HomeIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const BotIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

const TasksIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

const WorkflowIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="15" y="3" width="6" height="6" rx="1" />
    <rect x="3" y="15" width="6" height="6" rx="1" />
    <rect x="15" y="15" width="6" height="6" rx="1" />
    <path d="M9 6h6M9 18h6M18 9v6M6 9v6" />
  </svg>
);

const FileStackIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
    <polyline points="13 2 13 9 20 9" />
    <path d="M8 13h8M8 17h8" />
  </svg>
);

const BrainIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

const WrenchIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const KeyIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
);

const FileTextIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const HelpIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const DefaultIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const SettingsIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const UserIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChevronDownIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const LinkIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);
