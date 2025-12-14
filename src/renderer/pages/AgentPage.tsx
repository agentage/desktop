import { Navigate, useParams } from 'react-router-dom';
import { AgentRunner } from '../components/features/agents/AgentRunner.js';

/**
 * Agent runner page - displays the agent runner for a specific agent
 * Route: /agent/:name
 */
export const AgentPage = (): React.JSX.Element => {
  const { name } = useParams<{ name: string }>();

  // Redirect to home if no agent name provided
  if (!name) {
    return <Navigate to="/" replace />;
  }

  return <AgentRunner agentName={name} />;
};
