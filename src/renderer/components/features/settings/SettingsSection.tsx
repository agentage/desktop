import type { ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export const SettingsSection = ({ title, children }: SettingsSectionProps): React.JSX.Element => (
  <section className="settings-section">
    <h2 className="settings-section-title">{title}</h2>
    <div className="settings-section-content">{children}</div>
  </section>
);
