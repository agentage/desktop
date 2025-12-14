import { SettingsSection } from './SettingsSection.js';

interface AppearanceSectionProps {
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export const AppearanceSection = ({
  theme,
  onThemeChange,
}: AppearanceSectionProps): React.JSX.Element => (
  <SettingsSection title="Appearance">
    <div className="settings-field">
      <label className="settings-label">Theme</label>
      <div className="radio-group">
        <label className="radio-option">
          <input
            type="radio"
            name="theme"
            value="light"
            checked={theme === 'light'}
            onChange={(e) => {
              onThemeChange(e.target.value as 'light' | 'dark' | 'system');
            }}
          />
          <span>Light</span>
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name="theme"
            value="dark"
            checked={theme === 'dark'}
            onChange={(e) => {
              onThemeChange(e.target.value as 'light' | 'dark' | 'system');
            }}
          />
          <span>Dark</span>
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name="theme"
            value="system"
            checked={theme === 'system'}
            onChange={(e) => {
              onThemeChange(e.target.value as 'light' | 'dark' | 'system');
            }}
          />
          <span>System</span>
        </label>
      </div>
    </div>
  </SettingsSection>
);
