import { useEffect, useState } from 'react';

/**
 * Hook to manage theme state and synchronization
 */
export const useTheme = (): {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  isLoading: boolean;
} => {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async (): Promise<void> => {
      try {
        const settings = await window.agentage.settings.get();
        setThemeState(settings.theme);
        applyTheme(settings.theme);
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme().catch(console.error);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (): void => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return (): void => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  const setTheme = async (newTheme: 'light' | 'dark' | 'system'): Promise<void> => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    await window.agentage.settings.update({ theme: newTheme });
  };

  return { theme, setTheme, isLoading };
};

/**
 * Apply theme to document
 */
function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  const root = document.documentElement;

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}
