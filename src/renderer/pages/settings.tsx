import { useEffect, useState } from 'react';
import type { ComposerSettings, Settings } from '../../shared/types/index.js';
import { cn } from '../lib/utils.js';

// Check icon for save
const CheckIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// X icon for cancel
const XIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Edit icon
const EditIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// Default composer settings
const DEFAULT_COMPOSER_SETTINGS: ComposerSettings = {
  fontSize: 'medium',
  iconSize: 'medium',
  spacing: 'normal',
  accentColor: '#3B82F6',
};

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

const PaletteIcon = (): React.JSX.Element => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="13.5" cy="6.5" r=".5" />
    <circle cx="17.5" cy="10.5" r=".5" />
    <circle cx="8.5" cy="7.5" r=".5" />
    <circle cx="6.5" cy="12.5" r=".5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

const ACCENT_COLORS = [
  { id: 'blue', value: '#3B82F6', name: 'Blue' },
  { id: 'purple', value: '#8B5CF6', name: 'Purple' },
  { id: 'green', value: '#22C55E', name: 'Green' },
  { id: 'orange', value: '#F97316', name: 'Orange' },
  { id: 'pink', value: '#EC4899', name: 'Pink' },
  { id: 'cyan', value: '#06B6D4', name: 'Cyan' },
];

/** Reusable settings section component - matches composer styling */
interface SettingsSectionProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingsSection = ({
  icon,
  iconColor,
  title,
  description,
  children,
}: SettingsSectionProps): React.JSX.Element => (
  <div className="rounded-lg border border-border bg-sidebar p-4">
    <div className="flex items-center gap-3 mb-4">
      <div className={cn('flex size-8 items-center justify-center rounded-md', iconColor)}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
    {children}
  </div>
);

/** Option button for toggle groups - matches composer styling */
interface OptionButtonProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const OptionButton = ({
  selected,
  onClick,
  children,
  className,
}: OptionButtonProps): React.JSX.Element => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs transition-all duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      selected
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted/30 text-muted-foreground hover:bg-accent hover:text-foreground border border-border',
      className
    )}
  >
    {children}
  </button>
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
  const [originalUrl, setOriginalUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isEditingUrl, setIsEditingUrl] = useState(false);

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
        setOriginalUrl(settingsData.backendUrl);
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

  const handleSaveUrl = async (): Promise<void> => {
    if (!settings) return;
    try {
      new URL(backendUrl);
      setUrlError(null);
      await window.agentage.settings.update({ backendUrl });
      setOriginalUrl(backendUrl);
      setIsEditingUrl(false);
    } catch {
      setUrlError('Invalid URL');
    }
  };

  const handleCancelUrl = (): void => {
    setBackendUrl(originalUrl);
    setUrlError(null);
    setIsEditingUrl(false);
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
      <div className="flex-1 p-6">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex-1 p-6">
        <div className="text-sm text-destructive">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 h-full">
      <div className="max-w-2xl mx-auto space-y-6 pb-48">
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>

        <div className="space-y-3">
          {/* Appearance */}
          <SettingsSection
            icon={<MoonIcon />}
            iconColor="bg-violet-500/10 text-violet-500"
            title="Appearance"
            description="Choose your theme"
          >
            <div className="grid grid-cols-3 gap-2">
              <OptionButton
                selected={settings.theme === 'light'}
                onClick={() => {
                  void handleThemeChange('light');
                }}
                className="flex-col gap-1 py-1.5"
              >
                <SunIcon />
                <span>Light</span>
              </OptionButton>
              <OptionButton
                selected={settings.theme === 'dark'}
                onClick={() => {
                  void handleThemeChange('dark');
                }}
                className="flex-col gap-1 py-1.5"
              >
                <MoonIcon />
                <span>Dark</span>
              </OptionButton>
              <OptionButton
                selected={settings.theme === 'system'}
                onClick={() => {
                  void handleThemeChange('system');
                }}
                className="flex-col gap-1 py-1.5"
              >
                <MonitorIcon />
                <span>System</span>
              </OptionButton>
            </div>
          </SettingsSection>

          {/* Composer Settings */}
          <SettingsSection
            icon={<PaletteIcon />}
            iconColor="bg-blue-500/10 text-blue-500"
            title="Composer"
            description="Customize chat input appearance"
          >
            <div className="space-y-4">
              {/* Font Size */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Font Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <OptionButton
                      key={size}
                      selected={composerSettings.fontSize === size}
                      onClick={() => {
                        void handleComposerSettingChange('fontSize', size);
                      }}
                      className="capitalize"
                    >
                      {size}
                    </OptionButton>
                  ))}
                </div>
              </div>

              {/* Icon Size */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Icon Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <OptionButton
                      key={size}
                      selected={composerSettings.iconSize === size}
                      onClick={() => {
                        void handleComposerSettingChange('iconSize', size);
                      }}
                      className="capitalize"
                    >
                      {size}
                    </OptionButton>
                  ))}
                </div>
              </div>

              {/* Spacing */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Spacing
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['compact', 'normal', 'relaxed'] as const).map((spacing) => (
                    <OptionButton
                      key={spacing}
                      selected={composerSettings.spacing === spacing}
                      onClick={() => {
                        void handleComposerSettingChange('spacing', spacing);
                      }}
                      className="capitalize"
                    >
                      {spacing}
                    </OptionButton>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color.id}
                      title={color.name}
                      onClick={() => {
                        void handleComposerSettingChange('accentColor', color.value);
                      }}
                      className={cn(
                        'size-[18px] rounded-full transition-all duration-200',
                        'hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                        composerSettings.accentColor === color.value &&
                          'ring-2 ring-offset-2 ring-offset-sidebar'
                      )}
                      style={
                        {
                          backgroundColor: color.value,
                          '--tw-ring-color':
                            composerSettings.accentColor === color.value ? color.value : undefined,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Advanced */}
          <SettingsSection
            icon={<ServerIcon />}
            iconColor="bg-amber-500/10 text-amber-500"
            title="Advanced"
            description="Backend & storage"
          >
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Backend URL
                </label>
                {isEditingUrl ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={backendUrl}
                      onChange={(e) => {
                        setBackendUrl(e.target.value);
                        setUrlError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void handleSaveUrl();
                        if (e.key === 'Escape') handleCancelUrl();
                      }}
                      className={cn(
                        'flex-1 px-2 py-1 text-sm border rounded bg-background text-foreground',
                        'focus:outline-none focus:border-primary',
                        urlError ? 'border-destructive' : 'border-border'
                      )}
                      placeholder="https://agentage.io"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        void handleSaveUrl();
                      }}
                      className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                      title="Save"
                    >
                      <CheckIcon />
                    </button>
                    <button
                      onClick={handleCancelUrl}
                      className="p-1 text-muted-foreground hover:bg-muted rounded"
                      title="Cancel"
                    >
                      <XIcon />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-sm text-foreground truncate">{backendUrl}</span>
                    <button
                      onClick={() => {
                        setIsEditingUrl(true);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                      title="Edit"
                    >
                      <EditIcon />
                    </button>
                  </div>
                )}
                {urlError && <div className="mt-1.5 text-xs text-destructive">{urlError}</div>}
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Agent Directory
                </label>
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-muted-foreground truncate">{configDir}</span>
                  <button
                    onClick={handleOpenConfigDir}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                    title="Open in file manager"
                  >
                    <FolderIcon />
                  </button>
                </div>
              </div>
            </div>
          </SettingsSection>
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
