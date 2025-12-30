import { useEffect, useState } from 'react';
import type { Settings } from '../../shared/types/index.js';
import { Button, Card, CardContent, CardHeader } from '../components/ui/index.js';

// Icons (size-4 for smaller)
const MoonIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MonitorIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const FolderIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const ServerIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
);

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

  const handleBackendUrlBlur = async (): Promise<void> => {
    if (!settings) return;
    try {
      new URL(backendUrl);
      setUrlError(null);
      await window.agentage.settings.update({ backendUrl });
    } catch {
      setUrlError('Invalid URL');
    }
  };

  const handleOpenConfigDir = (): void => {
    window.agentage.app.openPath(configDir).catch(console.error);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center p-6">
        <span className="text-xs text-destructive">Failed to load settings</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Appearance */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
              <MoonIcon />
            </div>
            <div>
              <div className="text-sm font-medium">Appearance</div>
              <div className="text-xs text-muted-foreground">Choose your theme</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-3 gap-1.5">
            <Button
              variant={settings.theme === 'light' ? 'default' : 'outline'}
              size="sm"
              className="flex flex-col gap-0.5 py-3"
              onClick={() => {
                void handleThemeChange('light');
              }}
            >
              <SunIcon />
              <span className="text-[10px]">Light</span>
            </Button>
            <Button
              variant={settings.theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              className="flex flex-col gap-0.5 py-3"
              onClick={() => {
                void handleThemeChange('dark');
              }}
            >
              <MoonIcon />
              <span className="text-[10px]">Dark</span>
            </Button>
            <Button
              variant={settings.theme === 'system' ? 'default' : 'outline'}
              size="sm"
              className="flex flex-col gap-0.5 py-3"
              onClick={() => {
                void handleThemeChange('system');
              }}
            >
              <MonitorIcon />
              <span className="text-[10px]">System</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <ServerIcon />
            </div>
            <div>
              <div className="text-sm font-medium">Advanced</div>
              <div className="text-xs text-muted-foreground">Backend & storage</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <div>
            <label htmlFor="backend-url" className="mb-1 block text-xs font-medium">
              Backend URL
            </label>
            <input
              id="backend-url"
              type="url"
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              placeholder="https://agentage.io"
              value={backendUrl}
              onChange={(e) => {
                setBackendUrl(e.target.value);
                setUrlError(null);
              }}
              onBlur={() => {
                void handleBackendUrlBlur();
              }}
            />
            {urlError && <div className="mt-1 text-[10px] text-destructive">{urlError}</div>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Agent Directory</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="h-8 flex-1 rounded-md border border-input bg-muted px-2 text-xs text-muted-foreground"
                value={configDir}
                readOnly
                disabled
              />
              <Button variant="outline" size="sm" onClick={handleOpenConfigDir}>
                <FolderIcon />
                <span className="text-xs">Open</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
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
