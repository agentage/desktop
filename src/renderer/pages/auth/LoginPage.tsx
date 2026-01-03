import { useNavigate } from 'react-router-dom';
import { Button, UserIcon } from '../../components/index.js';
import { useAuth } from '../../hooks/useAuth.js';

// Loader icon (Lucide loader-2)
const LoaderIcon = (): React.JSX.Element => (
  <svg
    className="h-6 w-6 animate-spin text-primary"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

/**
 * Login page - renders inside LoginLayout
 *
 * Purpose: User authentication entry point
 * Features: Login button, continue without sign in, branding
 */
export const LoginPage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { user, isLoading, login } = useAuth();

  const handleLogin = (): void => {
    login()
      .then((result) => {
        if (result.success) {
          void navigate('/');
        }
      })
      .catch((err: unknown) => {
        console.error('Login failed:', err);
      });
  };

  const handleContinue = (): void => {
    void navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      {/* Logo/Brand */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold text-primary">Agentage</h1>
        <p className="text-sm text-muted-foreground">AI Agent Management</p>
      </div>

      {/* Card Container */}
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <LoaderIcon />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : user ? (
          <div className="flex flex-col items-center gap-6">
            {/* User Avatar */}
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <UserIcon />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                Welcome back, {user.name ?? user.email}!
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Ready to continue?</p>
            </div>
            <Button className="w-full" onClick={handleContinue}>
              Get Started
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <p className="text-center text-sm text-muted-foreground">
              Sign in to sync agents and settings across devices
            </p>
            <div className="flex w-full flex-col gap-3">
              <Button className="w-full" onClick={handleLogin}>
                Sign in to Agentage
              </Button>
              <Button variant="ghost" className="w-full" onClick={handleContinue}>
                Continue without signing in
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
