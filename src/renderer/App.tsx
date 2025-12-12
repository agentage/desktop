import { useState } from 'react';
import { AppLayout } from './app/layout.js';
import { AgentRunner, ElectronErrorScreen, LoadingScreen } from './components/index.js';
import { useAppInit, useAuth } from './hooks/index.js';
import { HomePage } from './pages/index.js';

export const App = (): React.JSX.Element => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const { isInitializing, electronHealthy, user: initialUser, error } = useAppInit();
  const { user, isLoading } = useAuth();

  // Use user from useAuth if available (reactive to login), otherwise use initialUser
  const currentUser = user ?? initialUser;

  // Step 1: Show loading screen during initialization or auth actions
  if (isInitializing || (isLoading && !currentUser)) {
    return <LoadingScreen message="Initializing application..." />;
  }

  // Step 2: Show error screen if Electron IPC is not available
  if (!electronHealthy && error) {
    return <ElectronErrorScreen error={error} />;
  }

  // Step 3: Show login page if user is not authenticated
  if (!currentUser) {
    return (
      <HomePage
        onGetStarted={() => {
          window.location.reload();
        }}
      />
    );
  }

  // Step 4: Show main app for authenticated users
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
