import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  GoogleIcon,
  IconContainer,
  LogOutIcon,
  Section,
  SettingsIcon,
  UserIcon,
} from '../components/ui/index.js';
import { useAuth } from '../hooks/index.js';

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
      <div className="flex-1 p-6">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 p-6">
        <div className="text-sm text-destructive">Failed to load account</div>
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
    <div className="flex-1 p-6 h-full">
      <div className="max-w-2xl mx-auto space-y-6 pb-48">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <UserIcon />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Account</h1>
        </div>

        <div className="space-y-3">
          {/* Profile Section */}
          <Section
            icon={<UserIcon />}
            iconColor="blue"
            title="Profile"
            description="Your account information"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  void navigate('/settings');
                }}
              >
                <SettingsIcon />
                <span>Settings</span>
              </Button>
            }
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name ?? user.email}
                    className="size-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-md bg-muted text-foreground text-sm font-medium">
                    {initials}
                  </div>
                )}
              </div>
              {/* User Info */}
              <div className="flex flex-col gap-0.5">
                {user.name && (
                  <div className="text-sm font-medium text-foreground">{user.name}</div>
                )}
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>
          </Section>

          {/* Authentication Section */}
          <Section
            icon={<GoogleIcon />}
            iconColor="amber"
            title="Authentication"
            description="Sign-in method and session"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconContainer color="muted">
                    <GoogleIcon />
                  </IconContainer>
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
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOutIcon />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};
