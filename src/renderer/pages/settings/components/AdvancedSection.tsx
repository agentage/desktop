import { useState } from 'react';
import { SettingsSection } from './SettingsSection.js';

interface AdvancedSectionProps {
  backendUrl: string;
  configDir: string;
  onBackendUrlChange: (url: string) => void;
  onOpenConfigDir: () => void;
}

/**
 * Advanced settings section
 * 
 * Purpose: Backend URL configuration, config directory access
 * Features: URL input with validation, open config dir button
 */
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
      <div>
        <label htmlFor="backend-url">Backend URL</label>
        <input
          id="backend-url"
          type="url"
          placeholder="https://agentage.io"
          value={url}
          onChange={(e) => { handleUrlChange(e.target.value); }}
          onBlur={handleUrlBlur}
        />
        {urlError && <div>{urlError}</div>}
      </div>

      <div>
        <label>Agent Directory</label>
        <div>
          <input type="text" value={configDir} readOnly disabled />
          <button type="button" onClick={onOpenConfigDir}>Open in Explorer</button>
        </div>
      </div>
    </SettingsSection>
  );
};
