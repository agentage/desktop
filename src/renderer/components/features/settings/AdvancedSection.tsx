import { useState } from 'react';
import { SettingsSection } from './SettingsSection.js';

interface AdvancedSectionProps {
  backendUrl: string;
  configDir: string;
  onBackendUrlChange: (url: string) => void;
  onOpenConfigDir: () => void;
}

export const AdvancedSection = ({
  backendUrl,
  configDir,
  onBackendUrlChange,
  onOpenConfigDir,
}: AdvancedSectionProps): React.JSX.Element => {
  const [url, setUrl] = useState(backendUrl);
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleUrlChange = (value: string): void => {
    setUrl(value);
    setUrlError(null);
  };

  const handleUrlBlur = (): void => {
    try {
      new URL(url);
      onBackendUrlChange(url);
    } catch {
      setUrlError('Invalid URL format');
    }
  };

  return (
    <SettingsSection title="Advanced">
      <div className="settings-field">
        <label htmlFor="backend-url" className="settings-label">
          Backend URL
        </label>
        <input
          id="backend-url"
          type="url"
          className="settings-input"
          placeholder="https://agentage.io"
          value={url}
          onChange={(e) => {
            handleUrlChange(e.target.value);
          }}
          onBlur={handleUrlBlur}
        />
        {urlError && <div className="field-error">{urlError}</div>}
      </div>

      <div className="settings-field">
        <label className="settings-label">Agent Directory</label>
        <div className="input-group">
          <input type="text" className="settings-input" value={configDir} readOnly disabled />
          <button type="button" className="btn btn-secondary" onClick={onOpenConfigDir}>
            Open in Explorer
          </button>
        </div>
      </div>
    </SettingsSection>
  );
};
