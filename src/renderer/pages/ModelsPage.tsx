import { useEffect, useState } from 'react';
import type { ModelProvider, Settings } from '../../shared/types/index.js';
import { ProviderSection } from '../components/features/settings/index.js';
import '../styles/settings.css';

/**
 * Models page - manage model providers
 * Route: /models
 * Content only - rendered inside AppLayout
 */
export const ModelsPage = (): React.JSX.Element => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      try {
        const settingsData = await window.agentage.settings.get();
        setSettings(settingsData);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings().catch(console.error);
  }, []);

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

  if (loading) {
    return (
      <div className="settings-page loading">
        <div className="settings-loading">Loading models...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="settings-page error">
        <div className="settings-error">Failed to load models</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-content">
        <ProviderSection
          providers={settings.models}
          onProviderUpdate={(provider) => {
            void handleProviderUpdate(provider);
          }}
        />
      </div>
    </div>
  );
};
