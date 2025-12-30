import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { cn } from '../../lib/utils.js';

// Chevrons icon
const ChevronsUpDown = (): React.JSX.Element => (
  <svg
    className="ml-auto size-4"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </svg>
);

// User icon
const UserIcon = (): React.JSX.Element => (
  <svg
    className="size-4"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Settings icon
const SettingsIcon = (): React.JSX.Element => (
  <svg
    className="size-4"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Log out icon
const LogOutIcon = (): React.JSX.Element => (
  <svg
    className="size-4"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

interface NavUserProps {
  isCollapsed?: boolean;
}

/**
 * User navigation component for sidebar footer
 * Shows user profile with dropdown menu for account actions
 */
export const NavUser = ({ isCollapsed = false }: NavUserProps): React.JSX.Element => {
  const { user, isLoading, login, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogin = async (): Promise<void> => {
    await login();
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-12 items-center justify-center">
        <span className="text-muted-foreground text-sm">...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => void handleLogin()}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg p-2',
          'hover:bg-card transition-colors',
          isCollapsed && 'justify-center'
        )}
        title="Sign in"
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <UserIcon />
        </div>
        {!isCollapsed && <span className="text-sm text-foreground">Sign in</span>}
      </button>
    );
  }

  const initials = (user.name ?? user.email).charAt(0).toUpperCase();

  if (isCollapsed) {
    return (
      <button
        onClick={() => void navigate('/account')}
        className={cn(
          'flex size-10 items-center justify-center rounded-lg mx-auto',
          'bg-primary text-primary-foreground text-sm font-medium',
          'hover:opacity-90 transition-opacity'
        )}
        title={user.name ?? user.email}
      >
        {initials}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg p-2',
          'hover:bg-card transition-colors',
          isOpen && 'bg-card'
        )}
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium">
          {initials}
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium text-foreground">{user.name ?? 'User'}</span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        </div>
        <ChevronsUpDown />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
            }}
          />
          <div className="absolute bottom-full left-0 right-0 z-50 mb-1 rounded-lg border border-border bg-card p-1 shadow-lg">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                {initials}
              </div>
              <div className="grid flex-1 text-sm leading-tight">
                <span className="truncate font-medium text-foreground">{user.name ?? 'User'}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <div className="my-1 h-px bg-border" />
            <button
              onClick={() => {
                void navigate('/account');
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              <UserIcon />
              <span>Account</span>
            </button>
            <button
              onClick={() => {
                void navigate('/settings');
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              <SettingsIcon />
              <span>Settings</span>
            </button>
            <div className="my-1 h-px bg-border" />
            <button
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOutIcon />
              <span>Log out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
