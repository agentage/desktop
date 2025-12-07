import { useEffect, useState } from 'react';

interface AgentListProps {
  onSelect: (name: string) => void;
  selectedAgent: string | null;
}

export const AgentList = ({ onSelect, selectedAgent }: AgentListProps): React.JSX.Element => {
  const [agents, setAgents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAgents = async (): Promise<void> => {
      try {
        const list = await window.agentage.agents.list();
        setAgents(list);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agents');
      } finally {
        setLoading(false);
      }
    };

    void loadAgents();
  }, []);

  if (loading) {
    return <div className="agent-list loading">Loading agents...</div>;
  }

  if (error) {
    return <div className="agent-list error">{error}</div>;
  }

  if (agents.length === 0) {
    return (
      <div className="agent-list empty">
        <p>No agents found</p>
        <p className="hint">Create an agent with: agent init my-agent</p>
      </div>
    );
  }

  return (
    <div className="agent-list">
      <h2>Agents</h2>
      <ul>
        {agents.map((agent) => (
          <li key={agent}>
            <button
              className={selectedAgent === agent ? 'selected' : ''}
              onClick={() => {
                onSelect(agent);
              }}
              type="button"
            >
              {agent}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
