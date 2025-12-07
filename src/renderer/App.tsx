import { useState } from 'react';
import { AppLayout } from './app/layout.js';
import { AgentRunner } from './components/features/agents/index.js';
import { HomePage } from './pages/index.js';

export const App = (): React.JSX.Element => {
  const [showStartPage, setShowStartPage] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const handleGetStarted = (): void => {
    setShowStartPage(false);
  };

  if (showStartPage) {
    return <HomePage onGetStarted={handleGetStarted} />;
  }

  return (
    <AppLayout selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent}>
      {selectedAgent ? (
        <AgentRunner agentName={selectedAgent} />
      ) : (
        <div className="empty-state">
          <p>Select an agent to get started</p>
        </div>
      )}
    </AppLayout>
  );
};
