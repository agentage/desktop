import { useState } from 'react';
import { AgentList } from './components/AgentList.js';
import { AgentRunner } from './components/AgentRunner.js';

export const App = (): React.JSX.Element => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Agentage Desktop</h1>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <AgentList onSelect={setSelectedAgent} selectedAgent={selectedAgent} />
        </aside>

        <section className="content">
          {selectedAgent ? (
            <AgentRunner agentName={selectedAgent} />
          ) : (
            <div className="empty-state">
              <p>Select an agent to get started</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
