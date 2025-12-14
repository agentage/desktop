import { Outlet } from 'react-router-dom';
import { useElectronHealth } from '../hooks/useElectronHealth.js';
import { ErrorLayout, LoadingLayout } from '../layouts/index.js';

/**
 * Guard that checks if Electron IPC is available
 * Shows error layout if IPC is unavailable
 */
export const ElectronGuard = (): React.JSX.Element => {
  const { isHealthy, isChecking, error } = useElectronHealth();

  // Show loading while checking
  if (isChecking) {
    return <LoadingLayout message="Initializing application..." />;
  }

  // Show error if Electron IPC is not available
  if (!isHealthy && error) {
    return <ErrorLayout error={error} />;
  }

  // Render children if healthy
  return <Outlet />;
};
