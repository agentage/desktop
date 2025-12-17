import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Agents page - displays a grid of available agents
 * Route: /
 * Features: Search/filter, agent cards, empty state
 */
export const AgentsPage = (): React.JSX.Element => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    const query = searchQuery.toLowerCase();
    return agents.filter((agent) => agent.toLowerCase().includes(query));
  }, [agents, searchQuery]);

  const handleAgentClick = (name: string): void => {
    void navigate(`/agent/${encodeURIComponent(name)}`);
  };

  const handleNewAgent = (): void => {
    void navigate('/agents/new');
  };

  if (loading) {
    return (
      <div className="agents-page">
        <div className="agents-loading">
          <div className="loading-spinner" />
          <p>Loading agents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agents-page">
        <div className="agents-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="agents-page">
      <header className="agents-header">
        <h1>My Agents</h1>
        <button type="button" className="btn-primary" onClick={handleNewAgent}>
          + New Agent
        </button>
      </header>

      <div className="agents-search">
        <input
          type="text"
          placeholder="🔍 Search agents..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          className="search-input"
        />
      </div>

      {agents.length === 0 ? (
        <div className="agents-empty">
          <div className="empty-content">
            <span className="empty-icon">📝</span>
            <h2>Create your first agent</h2>
            <p>Get started by creating an agent using the CLI:</p>
            <code>agent init my-agent</code>
            <button type="button" className="btn-primary" onClick={handleNewAgent}>
              + New Agent
            </button>
          </div>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="agents-empty">
          <div className="empty-content">
            <span className="empty-icon">🔍</span>
            <h2>No agents found</h2>
            <p>No agents match &quot;{searchQuery}&quot;</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSearchQuery('');
              }}
            >
              Clear search
            </button>
          </div>
        </div>
      ) : (
        <div className="agents-grid">
          {filteredAgents.map((agent) => (
            <button
              key={agent}
              type="button"
              className="agent-card"
              onClick={() => {
                handleAgentClick(agent);
              }}
            >
              <div className="agent-card-icon">📝</div>
              <div className="agent-card-content">
                <h3 className="agent-card-name">{agent}</h3>
                <div className="agent-card-meta">
                  <span className="agent-card-model">gpt-4o</span>
                  <span className="agent-card-tools">🔧 0 tools</span>
                </div>
              </div>
              <div className="agent-card-actions">
                <span className="action-hint">Click to run →</span>
              </div>
            </button>
          ))}
          <button type="button" className="agent-card agent-card--new" onClick={handleNewAgent}>
            <div className="agent-card-icon">➕</div>
            <div className="agent-card-content">
              <h3 className="agent-card-name">New Agent</h3>
              <p className="agent-card-description">Create a new agent</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
