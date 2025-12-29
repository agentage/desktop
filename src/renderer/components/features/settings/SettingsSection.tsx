import type { ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

/**
 * Settings section wrapper component
 * 
 * Purpose: Provide consistent section layout for settings pages
 * Features: Section title, content container
 */
export const SettingsSection = ({ title, children }: SettingsSectionProps): React.JSX.Element => (
  <section>
    <h2>{title}</h2>
    <div>{children}</div>
  </section>
);
