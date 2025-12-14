import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

/**
 * Left sidebar navigation component - Manus-style design
 * Collapsible with hamburger menu for mobile/compact mode
 * Contains: main navigation, projects, and user section at bottom
 */
export const Sidebar = (): React.JSX.Element => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isLoading, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current route for active state
  const isSettingsActive = location.pathname === '/settings';
  const isHomeActive = location.pathname === '/';

  const handleLogin = async (): Promise<void> => {
    await login();
  };

  const handleOpenDocs = (): void => {
    window.open('https://docs.agentage.dev', '_blank');
  };

  const toggleCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSettingsClick = (): void => {
    void navigate('/settings');
  };

  const handleNewTask = (): void => {
    void navigate('/');
  };

  const handleAllTasks = (): void => {
    void navigate('/');
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

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <NavItem
          icon={<EditIcon />}
          label="New task"
          onClick={handleNewTask}
          isActive={false}
          collapsed={isCollapsed}
        />
        <NavItem icon={<SearchIcon />} label="Search" isActive={false} collapsed={isCollapsed} />
        <NavItem icon={<LibraryIcon />} label="Library" isActive={false} collapsed={isCollapsed} />
      </nav>

      {/* Projects Section */}
      <div className="sidebar-section">
        {!isCollapsed && (
          <div className="sidebar-section-header">
            <span>Projects</span>
            <button className="sidebar-add-btn" title="New project">
              <PlusIcon />
            </button>
          </div>
        )}
        <NavItem
          icon={<FolderIcon />}
          label="New project"
          isActive={false}
          collapsed={isCollapsed}
        />
      </div>

      {/* All Tasks */}
      <div className="sidebar-section">
        <NavItem
          icon={<TasksIcon />}
          label="All tasks"
          onClick={handleAllTasks}
          isActive={isHomeActive && !isSettingsActive}
          hasDropdown={!isCollapsed}
          collapsed={isCollapsed}
        />
      </div>

      {/* Spacer */}
      <div className="sidebar-spacer" />

      {/* Empty State - Only show when expanded */}
      {!isCollapsed && (
        <div className="sidebar-empty-state">
          <div className="empty-state-icon">
            <TaskOutlineIcon />
          </div>
          <p>Create a new task to get started</p>
        </div>
      )}

      {/* Footer - Settings, Docs, User */}
      <div className="sidebar-footer-section">
        {/* Share/Referral - Only show when expanded */}
        {!isCollapsed && (
          <div className="sidebar-share">
            <ShareIcon />
            <div className="sidebar-share-content">
              <span className="sidebar-share-title">Share Agentage with a friend</span>
              <span className="sidebar-share-subtitle">Get 500 credits each</span>
            </div>
            <ChevronRightIcon />
          </div>
        )}

        {/* Footer Actions */}
        <div className={`sidebar-footer-actions ${isCollapsed ? 'collapsed' : ''}`}>
          <button className="sidebar-footer-btn" title="Settings" onClick={handleSettingsClick}>
            <SettingsIcon />
          </button>
          <button
            className="sidebar-footer-btn"
            title="Help & Documentation"
            onClick={handleOpenDocs}
          >
            <HelpIcon />
          </button>
          <button className="sidebar-footer-btn" title="Notifications">
            <NotificationIcon />
          </button>

          {/* User Profile / Login */}
          {isLoading ? (
            <div className="sidebar-user-loading">...</div>
          ) : user ? (
            <button
              className="sidebar-user-btn"
              onClick={() => {
                void logout();
              }}
              title={`${user.name ?? user.email} - Click to logout`}
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
}

const NavItem = ({
  icon,
  label,
  onClick,
  isActive = false,
  hasDropdown = false,
  collapsed = false,
}: NavItemProps): React.JSX.Element => (
  <button
    className={`sidebar-nav-item ${isActive ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`}
    onClick={onClick}
    title={collapsed ? label : undefined}
  >
    <span className="nav-item-icon">{icon}</span>
    {!collapsed && <span className="nav-item-label">{label}</span>}
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

// Panel-left icon from Lucide - matches Manus sidebar toggle design
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

const EditIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const SearchIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const LibraryIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

const FolderIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);

const PlusIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TasksIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

const TaskOutlineIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 2" />
    <path d="M8 12h8M8 8h8M8 16h4" strokeDasharray="0" />
  </svg>
);

const ShareIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const SettingsIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const HelpIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const NotificationIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
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

const ChevronRightIcon = (): React.JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
