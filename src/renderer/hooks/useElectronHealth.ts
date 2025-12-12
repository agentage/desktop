import { useEffect, useState } from 'react';

interface ElectronHealthState {
  isChecking: boolean;
  isHealthy: boolean;
  error: string | null;
}

const HEALTH_CHECK_TIMEOUT = 1000; // 1 second
const PRELOAD_CHECK_INTERVAL = 50; // ms between preload checks
const PRELOAD_MAX_WAIT = 2000; // max time to wait for preload

/**
 * Wait for the preload script to expose window.agentage
 */
const waitForPreload = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Already available
    if (typeof window.agentage !== 'undefined') {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (typeof window.agentage !== 'undefined') {
        clearInterval(checkInterval);
        resolve(true);
        return;
      }

      if (Date.now() - startTime > PRELOAD_MAX_WAIT) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, PRELOAD_CHECK_INTERVAL);
  });
};

/**
 * Hook to check if Electron IPC bridge is available and responding
 */
export const useElectronHealth = (): ElectronHealthState => {
  const [state, setState] = useState<ElectronHealthState>({
    isChecking: true,
    isHealthy: false,
    error: null,
  });

  useEffect(() => {
    const checkHealth = async (): Promise<void> => {
      // Wait for preload script to be available
      const preloadReady = await waitForPreload();
      if (!preloadReady) {
        setState({
          isChecking: false,
          isHealthy: false,
          error: 'Electron bridge not available. Preload script may not be loaded.',
        });
        return;
      }

      // Try to call a simple IPC method with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Electron IPC timeout'));
        }, HEALTH_CHECK_TIMEOUT);
      });

      try {
        // Use app:version as health check - it's simple and always available
        await Promise.race([window.agentage.app.getVersion(), timeoutPromise]);

        setState({
          isChecking: false,
          isHealthy: true,
          error: null,
        });
      } catch (err) {
        setState({
          isChecking: false,
          isHealthy: false,
          error: err instanceof Error ? err.message : 'Unknown error communicating with Electron',
        });
      }
    };

    void checkHealth();
  }, []);

  return state;
};
