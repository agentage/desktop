import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { cn } from '../../lib/utils.js';

// Chevron down icon (matching composer style)
const ChevronDownIcon = (): React.JSX.Element => (
  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// User icon
const UserIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Settings icon
const SettingsIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Log out icon
const LogOutIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

/** User avatar component - shows image or fallback initials */
interface UserAvatarProps {
  src?: string;
  name?: string;
  email: string;
  size?: 'sm' | 'md';
  className?: string;
}

const UserAvatar = ({
  src,
  name,
  email,
  size = 'md',
  className,
}: UserAvatarProps): React.JSX.Element => {
  const initials = (name ?? email).charAt(0).toUpperCase();
  const sizeClasses = size === 'sm' ? 'size-7' : 'size-8';

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? email}
        className={cn(sizeClasses, 'rounded-full object-cover', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClasses,
        'flex items-center justify-center rounded-full',
        'bg-primary text-primary-foreground text-xs font-medium',
        className
      )}
    >
      {initials}
    </div>
  );
};

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
        <span className="text-xs text-muted-foreground">...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => void handleLogin()}
        className={cn(
          'flex w-full items-center gap-2 rounded-md p-2',
          'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
          'focus:outline-none focus:text-foreground',
          isCollapsed && 'justify-center'
        )}
        title="Sign in"
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
          <UserIcon />
        </div>
        {!isCollapsed && <span className="text-xs">Sign in</span>}
      </button>
    );
  }

  if (isCollapsed) {
    return (
      <button
        onClick={() => void navigate('/account')}
        className={cn(
          'flex items-center justify-center rounded-md mx-auto p-1',
          'hover:bg-accent transition-colors',
          'focus:outline-none'
        )}
        title={user.name ?? user.email}
      >
        <UserAvatar src={user.avatar} name={user.name} email={user.email} size="sm" />
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
          'flex w-full items-center gap-2 rounded-md p-2',
          'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
          'focus:outline-none focus:text-foreground',
          isOpen && 'bg-accent text-foreground'
        )}
      >
        <UserAvatar src={user.avatar} name={user.name} email={user.email} />
        <div className="grid flex-1 text-left leading-tight">
          <span className="truncate text-xs font-medium text-foreground">
            {user.name ?? 'User'}
          </span>
          <span className="truncate text-[10px] text-muted-foreground">{user.email}</span>
        </div>
        <ChevronDownIcon />
      </button>

      {/* Dropdown - styled like composer ModelSelector */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/20"
            onClick={() => {
              setIsOpen(false);
            }}
          />

          {/* Dropdown menu */}
          <div className="absolute bottom-full left-0 right-0 mb-1 z-[60] rounded-md border border-border bg-sidebar shadow-lg">
            <div className="p-1">
              {/* User info header */}
              <div className="flex items-center gap-2 px-2 py-1.5">
                <UserAvatar src={user.avatar} name={user.name} email={user.email} size="sm" />
                <div className="grid flex-1 leading-tight">
                  <span className="truncate text-xs font-medium text-foreground">
                    {user.name ?? 'User'}
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground">{user.email}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="my-1 border-t border-border" />

              {/* Menu items */}
              <button
                onClick={() => {
                  void navigate('/account');
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm',
                  'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left'
                )}
              >
                <UserIcon />
                <span>Account</span>
              </button>
              <button
                onClick={() => {
                  void navigate('/settings');
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm',
                  'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left'
                )}
              >
                <SettingsIcon />
                <span>Settings</span>
              </button>

              {/* Divider */}
              <div className="my-1 border-t border-border" />

              {/* Logout */}
              <button
                onClick={() => void handleLogout()}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-sm',
                  'text-destructive hover:bg-destructive/10 transition-colors text-left'
                )}
              >
                <LogOutIcon />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
