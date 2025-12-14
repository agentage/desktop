import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ModelProvider, Settings } from '../../shared/types/index.js';
import {
  AccountSection,
  AdvancedSection,
  AppearanceSection,
  ProviderSection,
} from '../components/features/settings/index.js';
import { useAuth } from '../hooks/index.js';
import '../styles/settings.css';

/**
 * Settings page - displays user settings
 * Route: /settings
 * Content only - rendered inside AppLayout
 */
export const SettingsPage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [configDir, setConfigDir] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      try {
        const [settingsData, configDirData] = await Promise.all([
          window.agentage.settings.get(),
          window.agentage.app.getConfigDir(),
        ]);

        setSettings(settingsData);
        setConfigDir(configDirData);

        // Apply theme on load
        applyTheme(settingsData.theme);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings().catch(console.error);
  }, []);

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system'): Promise<void> => {
    if (!settings) return;

    const updated = { ...settings, theme };
    setSettings(updated);

    // Apply theme immediately
    applyTheme(theme);

    // Save to config
    await window.agentage.settings.update({ theme });
  };

  const handleProviderUpdate = async (provider: ModelProvider): Promise<void> => {
    await window.agentage.settings.setModelProvider(provider);

    if (settings) {
      const models = [...settings.models];
      const index = models.findIndex((m) => m.id === provider.id);
      if (index >= 0) {
        models[index] = provider;
      } else {
        models.push(provider);
      }
      setSettings({ ...settings, models });
    }
  };

  const handleBackendUrlChange = async (backendUrl: string): Promise<void> => {
    if (!settings) return;

    const updated = { ...settings, backendUrl };
    setSettings(updated);
    await window.agentage.settings.update({ backendUrl });
  };

  const handleOpenConfigDir = (): void => {
    window.agentage.app.openPath(configDir).catch(console.error);
  };

  const handleLogout = (): void => {
    logout()
      .then(() => navigate('/login'))
      .catch(console.error);
  };

  if (loading) {
    return (
      <div className="settings-page loading">
        <div className="settings-loading">Loading settings...</div>
      </div>
    );
  }

  if (!settings || !user) {
    return (
      <div className="settings-page error">
        <div className="settings-error">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-content">
        <AppearanceSection
          theme={settings.theme}
          onThemeChange={(theme) => {
            void handleThemeChange(theme);
          }}
        />

        <AccountSection
          user={user}
          authProvider="Google" // TODO: Get actual provider
          onLogout={handleLogout}
        />

        <ProviderSection
          providers={settings.models}
          onProviderUpdate={(provider) => {
            void handleProviderUpdate(provider);
          }}
        />

        <AdvancedSection
          backendUrl={settings.backendUrl}
          configDir={configDir}
          onBackendUrlChange={(url) => {
            void handleBackendUrlChange(url);
          }}
          onOpenConfigDir={handleOpenConfigDir}
        />
      </div>
    </div>
  );
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
