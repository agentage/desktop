import { useEffect, useState } from 'react';
import type { ComposerSettings, Settings } from '../../../shared/types/index.js';
import {
  ACCENT_COLORS,
  ColorPicker,
  FolderIcon,
  FormField,
  IconButton,
  InlineEdit,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  Section,
  ServerIcon,
  SettingsIcon,
  SunIcon,
  ToggleGroup,
} from '../../components/ui/index.js';

// Default composer settings
const DEFAULT_COMPOSER_SETTINGS: ComposerSettings = {
  fontSize: 'medium',
  iconSize: 'medium',
  spacing: 'normal',
  accentColor: '#3B82F6',
};

// Map ACCENT_COLORS to ColorPicker format
const ACCENT_COLOR_OPTIONS = ACCENT_COLORS.map((c) => ({
  id: c.value,
  value: c.value,
  label: c.label,
}));

/**
 * Settings page - displays user settings
 * Route: /settings
 * Content only - rendered inside AppLayout
 */
export const SettingsPage = (): React.JSX.Element => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [configDir, setConfigDir] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [backendUrl, setBackendUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      try {
        const [settingsData, configDirData] = await Promise.all([
          window.agentage.settings.get(),
          window.agentage.app.getConfigDir(),
        ]);
        setSettings(settingsData);
        setConfigDir(configDirData);
        setBackendUrl(settingsData.backendUrl);
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
    applyTheme(theme);
    await window.agentage.settings.update({ theme });
  };

  const handleSaveUrl = async (newUrl: string): Promise<void> => {
    if (!settings) return;
    try {
      new URL(newUrl);
      setUrlError(null);
      await window.agentage.settings.update({ backendUrl: newUrl });
      setBackendUrl(newUrl);
    } catch {
      setUrlError('Invalid URL');
    }
  };

  const handleOpenConfigDir = (): void => {
    window.agentage.app.openPath(configDir).catch(console.error);
  };

  const composerSettings = settings?.composer ?? DEFAULT_COMPOSER_SETTINGS;

  const handleComposerSettingChange = async <K extends keyof ComposerSettings>(
    key: K,
    value: ComposerSettings[K]
  ): Promise<void> => {
    if (!settings) return;
    const newComposer = { ...composerSettings, [key]: value };
    const updated = { ...settings, composer: newComposer };
    setSettings(updated);
    await window.agentage.settings.update({ composer: newComposer });
  };

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex-1 p-4">
        <div className="text-sm text-destructive">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 h-full">
      <div className="max-w-3xl mx-auto space-y-4 pb-48">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-violet-500/10">
            <SettingsIcon />
          </div>
          <h1 className="text-base font-semibold text-foreground">Settings</h1>
        </div>

        <div className="space-y-3">
          {/* Appearance */}
          <Section
            icon={<MoonIcon />}
            iconColor="violet"
            title="Appearance"
            description="Choose your theme"
          >
            <ToggleGroup
              value={settings.theme}
              onChange={(theme) => {
                void handleThemeChange(theme);
              }}
              options={[
                { value: 'light', label: 'Light', icon: <SunIcon /> },
                { value: 'dark', label: 'Dark', icon: <MoonIcon /> },
                { value: 'system', label: 'System', icon: <MonitorIcon /> },
              ]}
              columns={3}
              vertical
            />
          </Section>

          {/* Composer Settings */}
          <Section
            icon={<PaletteIcon />}
            iconColor="blue"
            title="Composer"
            description="Customize chat input appearance"
          >
            <div className="space-y-4">
              {/* Font Size */}
              <FormField label="Font Size">
                <ToggleGroup
                  value={composerSettings.fontSize}
                  onChange={(size) => {
                    void handleComposerSettingChange('fontSize', size);
                  }}
                  options={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' },
                  ]}
                  columns={3}
                />
              </FormField>

              {/* Icon Size */}
              <FormField label="Icon Size">
                <ToggleGroup
                  value={composerSettings.iconSize}
                  onChange={(size) => {
                    void handleComposerSettingChange('iconSize', size);
                  }}
                  options={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' },
                  ]}
                  columns={3}
                />
              </FormField>

              {/* Spacing */}
              <FormField label="Spacing">
                <ToggleGroup
                  value={composerSettings.spacing}
                  onChange={(spacing) => {
                    void handleComposerSettingChange('spacing', spacing);
                  }}
                  options={[
                    { value: 'compact', label: 'Compact' },
                    { value: 'normal', label: 'Normal' },
                    { value: 'relaxed', label: 'Relaxed' },
                  ]}
                  columns={3}
                />
              </FormField>

              {/* Accent Color */}
              <FormField label="Accent Color">
                <ColorPicker
                  value={composerSettings.accentColor}
                  onChange={(colorValue) => {
                    void handleComposerSettingChange('accentColor', colorValue);
                  }}
                  colors={ACCENT_COLOR_OPTIONS}
                />
              </FormField>
            </div>
          </Section>

          {/* Advanced */}
          <Section
            icon={<ServerIcon />}
            iconColor="amber"
            title="Advanced"
            description="Backend & storage"
          >
            <div className="space-y-4">
              <FormField label="Backend URL" error={urlError ?? undefined}>
                <InlineEdit
                  value={backendUrl}
                  onSave={(newUrl) => {
                    void handleSaveUrl(newUrl);
                  }}
                  validate={(url) => {
                    try {
                      new URL(url);
                      return null;
                    } catch {
                      return 'Invalid URL';
                    }
                  }}
                />
              </FormField>

              <FormField label="Agent Directory">
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-muted-foreground truncate">{configDir}</span>
                  <IconButton
                    icon={<FolderIcon />}
                    onClick={handleOpenConfigDir}
                    title="Open in file manager"
                  />
                </div>
              </FormField>
            </div>
          </Section>
        </div>
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
