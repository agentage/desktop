import { useNavigate } from 'react-router-dom';
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
    <div>
      <h1>Agentage</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : user ? (
        <div>
          <p>Welcome back, {user.name ?? user.email}!</p>
          <button onClick={handleContinue}>Get Started</button>
        </div>
      ) : (
        <div>
          <p>Sign in to sync agents and settings</p>
          <button onClick={handleLogin}>Sign in to Agentage</button>
          <button onClick={handleContinue}>Continue without signing in</button>
        </div>
      )}
    </div>
  );
};
