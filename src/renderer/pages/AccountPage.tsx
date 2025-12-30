import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/index.js';
import { cn } from '../lib/utils.js';

// User icon
const UserIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Settings icon (gear)
const SettingsIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Logout icon
const LogoutIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// Google icon
const GoogleIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

/** Reusable section component - matches settings page styling */
interface SectionProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const Section = ({
  icon,
  iconColor,
  title,
  description,
  children,
  action,
}: SectionProps): React.JSX.Element => (
  <div className="rounded-lg border border-border bg-sidebar p-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={cn('flex size-8 items-center justify-center rounded-md', iconColor)}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      {action}
    </div>
    {children}
  </div>
);

/**
 * Account page - displays user account information
 * Route: /account
 * Content only - rendered inside AppLayout
 */
export const AccountPage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleLogout = (): void => {
    logout()
      .then(() => {
        void navigate('/login');
      })
      .catch(console.error);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-6">
        <span className="text-xs text-destructive">Failed to load account</span>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Profile Section */}
      <Section
        icon={<UserIcon />}
        iconColor="bg-blue-500/10 text-blue-500"
        title="Profile"
        description="Your account information"
        action={
          <button
            onClick={() => {
              void navigate('/settings');
            }}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-2 text-xs',
              'text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
            )}
            title="Settings"
          >
            <SettingsIcon />
            <span>Settings</span>
          </button>
        }
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name ?? user.email}
                className="size-14 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-medium ring-2 ring-border">
                {initials}
              </div>
            )}
          </div>
          {/* User Info */}
          <div className="flex flex-col gap-1">
            {user.name && <div className="text-sm font-medium text-foreground">{user.name}</div>}
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </Section>

      {/* Authentication Section */}
      <Section
        icon={<GoogleIcon />}
        iconColor="bg-amber-500/10 text-amber-500"
        title="Authentication"
        description="Sign-in method and session"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-md bg-muted/50">
                <GoogleIcon />
              </div>
              <div>
                <div className="text-sm text-foreground">Google</div>
                <div className="text-xs text-muted-foreground">Connected</div>
              </div>
            </div>
            <div className="flex size-6 items-center justify-center rounded-full bg-success/10">
              <div className="size-2 rounded-full bg-success" />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <button
              onClick={handleLogout}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs',
                'bg-muted/30 text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
                'border border-border transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
              )}
            >
              <LogoutIcon />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
};
