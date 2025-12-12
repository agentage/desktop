import { useCallback, useEffect, useState } from 'react';
import type { AuthResult, User } from '../../shared/types/auth.types.js';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<AuthResult>;
  logout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        const currentUser = await window.agentage.auth.getUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    void checkAuth();
  }, []);

  const login = useCallback(async (): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const result = await window.agentage.auth.login();
      if (result.success && result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await window.agentage.auth.logout();
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
  };
};
