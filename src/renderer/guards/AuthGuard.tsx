import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';
import { LoadingLayout } from '../layouts/index.js';

/**
 * Guard that protects routes requiring authentication
 * Redirects to /login if user is not authenticated
 *
 * TODO: Re-enable auth check (currently bypassed for development)
 */
export const AuthGuard = (): React.JSX.Element => {
  const { isLoading } = useAuth();
  const { isLoading: themeLoading } = useTheme();

  // Show loading while checking auth or theme
  if (isLoading || themeLoading) {
    return <LoadingLayout message="Loading..." />;
  }

  // TODO: Re-enable auth check
  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  // Render protected content
  return <Outlet />;
};
