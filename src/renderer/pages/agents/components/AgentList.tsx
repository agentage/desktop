import { useEffect, useState } from 'react';

interface AgentListProps {
  onSelect: (name: string) => void;
  selectedAgent: string | null;
}

/**
 * Agent list component
 *
 * Purpose: Display list of available agents, allow selection
 * Features: Load agents from IPC, display loading/error states,
 *           highlight selected agent
 */
export const AgentList = ({
  onSelect,
  selectedAgent: _selectedAgent,
}: AgentListProps): React.JSX.Element => {
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
    return <div>Loading agents...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (agents.length === 0) {
    return (
      <div>
        <p>No agents found</p>
        <p>Create an agent with: agent init my-agent</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Agents</h2>
      <ul>
        {agents.map((agent) => (
          <li key={agent}>
            <button
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
