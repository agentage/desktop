import { useEffect, useState } from 'react';
import type { User } from '../../shared/types/auth.types.js';

interface AppInitState {
  isInitializing: boolean;
  electronHealthy: boolean;
  user: User | null;
  error: string | null;
}

const HEALTH_CHECK_TIMEOUT = 1000; // 1 second

/**
 * Hook to initialize the app: check Electron health and load user auth state
 */
export const useAppInit = (): AppInitState => {
  const [state, setState] = useState<AppInitState>({
    isInitializing: true,
    electronHealthy: false,
    user: null,
    error: null,
  });

  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      try {
        // Step 1: Check if Electron bridge is available
        if (typeof window.agentage === 'undefined') {
          setState({
            isInitializing: false,
            electronHealthy: false,
            user: null,
            error: 'Electron bridge not available. Preload script may not be loaded.',
          });
          return;
        }

        // Step 2: Test Electron IPC with timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Electron IPC timeout'));
          }, HEALTH_CHECK_TIMEOUT);
        });

        await Promise.race([window.agentage.app.getVersion(), timeoutPromise]);

        // Step 3: Check user authentication
        const currentUser = await window.agentage.auth.getUser();

        setState({
          isInitializing: false,
          electronHealthy: true,
          user: currentUser,
          error: null,
        });
      } catch (err) {
        setState({
          isInitializing: false,
          electronHealthy: false,
          user: null,
          error: err instanceof Error ? err.message : 'Unknown error during initialization',
        });
      }
    };

    void initializeApp();
  }, []);

  return state;
};
