import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';
import { LoadingLayout } from '../layouts/index.js';

/**
 * Guard that protects routes requiring authentication
 * Redirects to /login if user is not authenticated
 */
export const AuthGuard = (): React.JSX.Element => {
  const { user, isLoading } = useAuth();
  const { isLoading: themeLoading } = useTheme();

  // Show loading while checking auth or theme
  if (isLoading || themeLoading) {
    return <LoadingLayout message="Loading..." />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return <Outlet />;
};
