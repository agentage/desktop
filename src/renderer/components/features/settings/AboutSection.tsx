import { SettingsSection } from './SettingsSection.js';

interface AboutSectionProps {
  version: string;
}

/**
 * About/Help settings section
 * 
 * Purpose: Display app version, documentation links, issue reporting
 * Features: Version info, external link buttons
 */
export const AboutSection = ({ version }: AboutSectionProps): React.JSX.Element => {
  const handleOpenUrl = (url: string) => (): void => {
    window.agentage.app.openExternal(url).catch(console.error);
  };

  return (
    <SettingsSection title="Help & Documentation">
      <div>
        <div>Agentage Desktop v{version}</div>
        <div>© 2025 Agentage</div>
      </div>

      <div>
        <button type="button" onClick={handleOpenUrl('https://docs.agentage.dev')}>
          Documentation
        </button>
        <button type="button" onClick={handleOpenUrl('https://github.com/agentage')}>
          GitHub
        </button>
        <button type="button" onClick={handleOpenUrl('https://github.com/agentage/desktop/issues')}>
          Report Issue
        </button>
      </div>
    </SettingsSection>
  );
};
