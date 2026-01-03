import { useNavigate } from 'react-router-dom';
import { BotIcon, Button, RefreshIcon } from '../../components/index.js';
import { useAuth } from '../../hooks/useAuth.js';

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
    <div className="flex w-full max-w-md flex-col items-center gap-8 rounded-xl border border-border bg-card p-8 shadow-lg">
      {/* Logo/Brand */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-primary shadow-lg">
          <svg className="size-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Agentage</h1>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="animate-spin">
            <RefreshIcon />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : user ? (
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-base text-foreground">Welcome back,</p>
            <p className="text-lg font-semibold text-foreground">{user.name ?? user.email}!</p>
          </div>
          <Button onClick={handleContinue} className="w-full" size="lg">
            Get Started
          </Button>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-6">
          <p className="text-center text-sm text-muted-foreground">
            Sign in to sync agents and settings
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleLogin} className="w-full" size="lg" aria-label="Sign in to Agentage">
              <BotIcon />
              <span>Sign in to Agentage</span>
            </Button>
            <Button onClick={handleContinue} variant="outline" className="w-full" size="lg">
              Continue without signing in
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
