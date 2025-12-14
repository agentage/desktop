import { useEffect, useState } from 'react';
import { AboutSection } from '../components/features/settings/index.js';
import '../styles/settings.css';

/**
 * Help & Documentation page
 * Route: /help
 * Content only - rendered inside AppLayout
 */
export const HelpPage = (): React.JSX.Element => {
  const [version, setVersion] = useState<string>('0.1.0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVersion = async (): Promise<void> => {
      try {
        const versionData = await window.agentage.app.getVersion();
        setVersion(versionData);
      } catch (error) {
        console.error('Failed to load version:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVersion().catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="settings-page loading">
        <div className="settings-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-content">
        <AboutSection version={version} />
      </div>
    </div>
  );
};
