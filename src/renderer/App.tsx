import { useState } from 'react';
import { AppLayout } from './app/layout.js';
import { AgentRunner, ElectronErrorScreen } from './components/index.js';
import { useElectronHealth } from './hooks/index.js';
import { HomePage } from './pages/index.js';

export const App = (): React.JSX.Element => {
  const [showStartPage, setShowStartPage] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const { isChecking, isHealthy, error } = useElectronHealth();

  const handleGetStarted = (): void => {
    setShowStartPage(false);
  };

  // Show loading while checking Electron health
  if (isChecking) {
    return (
      <div className="electron-checking">
        <div className="spinner" />
        <span>Initializing...</span>
      </div>
    );
  }

  // Show error screen if Electron IPC is not available
  if (!isHealthy && error) {
    return <ElectronErrorScreen error={error} />;
  }

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
