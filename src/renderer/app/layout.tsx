import { ReactNode } from 'react';
import { Sidebar, TitleBar } from '../components/index.js';

interface AppLayoutProps {
  children: ReactNode;
  selectedAgent: string | null;
  onSelectAgent: (name: string) => void;
}

export const AppLayout = ({
  children,
  selectedAgent,
  onSelectAgent,
}: AppLayoutProps): React.JSX.Element => (
  <div className="app">
    <TitleBar title="" showLogo={true} dark={true} />

    <main className="app-main">
      <Sidebar
        selectedAgent={selectedAgent}
        onSelectAgent={onSelectAgent}
        onNewTask={() => {
          onSelectAgent('');
        }}
      />

      <section className="content">{children}</section>
    </main>
  </div>
);
