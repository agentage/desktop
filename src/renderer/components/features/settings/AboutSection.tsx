import { SettingsSection } from './SettingsSection.js';

interface AboutSectionProps {
  version: string;
}

export const AboutSection = ({ version }: AboutSectionProps): React.JSX.Element => {
  const handleOpenUrl = (url: string) => (): void => {
    window.agentage.app.openExternal(url).catch(console.error);
  };

  return (
    <SettingsSection title="Help & Documentation">
      <div className="about-info">
        <div className="about-version">Agentage Desktop v{version}</div>
        <div className="about-copyright">© 2025 Agentage</div>
      </div>

      <div className="about-links">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleOpenUrl('https://docs.agentage.dev')}
        >
          Documentation
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleOpenUrl('https://github.com/agentage')}
        >
          GitHub
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleOpenUrl('https://github.com/agentage/desktop/issues')}
        >
          Report Issue
        </button>
      </div>
    </SettingsSection>
  );
};
