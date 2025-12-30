import { useEffect, useState } from 'react';

interface ElectronHealthState {
  isChecking: boolean;
  isHealthy: boolean;
  error: string | null;
}

// Increase timeouts for development mode where Vite needs time to start
const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds (was 1s - too aggressive)
const PRELOAD_CHECK_INTERVAL = 50; // ms between preload checks
const PRELOAD_MAX_WAIT = 5000; // max time to wait for preload (was 2s)
const RETRY_DELAY = 500; // delay between retries
const MAX_RETRIES = 3; // number of retries before giving up

/**
 * Wait for the preload script to expose window.agentage
 */
const waitForPreload = (): Promise<boolean> =>
  new Promise((resolve) => {
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

/**
 * Sleep helper for retry logic
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Hook to check if Electron IPC bridge is available and responding
 * Includes retry logic for race conditions during dev server startup
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

      // Retry logic for IPC health check
      let lastError: Error | null = null;
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          // Try to call a simple IPC method with timeout
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error('Electron IPC timeout'));
            }, HEALTH_CHECK_TIMEOUT);
          });

          // Use app:version as health check - it's simple and always available
          await Promise.race([window.agentage.app.getVersion(), timeoutPromise]);

          // Signal to main process that renderer is ready
          // This prevents auto-reload from main process
          try {
            await window.agentage.app.rendererReady();
          } catch {
            // Ignore errors - this is just a signal
          }

          // Success!
          setState({
            isChecking: false,
            isHealthy: true,
            error: null,
          });
          return;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Unknown error');

          // Wait before retrying (except on last attempt)
          if (attempt < MAX_RETRIES - 1) {
            await sleep(RETRY_DELAY);
          }
        }
      }

      // All retries failed
      setState({
        isChecking: false,
        isHealthy: false,
        error: lastError?.message ?? 'Unknown error communicating with Electron',
      });
    };

    void checkHealth();
  }, []);

  return state;
};
