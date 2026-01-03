import { useEffect, useState } from 'react';
import { BotIcon, IconContainer } from '../../index.js';

interface AgentCountResult {
  count: number;
}

export const AgentStatsComponent = (): React.JSX.Element => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async (): Promise<void> => {
      try {
        const result = (await window.agentage.widgets.callTool('agents:count', {})) as AgentCountResult;
        setCount(result.count);
      } catch (error) {
        console.error('Failed to fetch agent count:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchCount();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <IconContainer color="blue" size="sm">
          <BotIcon />
        </IconContainer>
        <span className="text-xs text-muted-foreground">Active Agents</span>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-2xl font-semibold tabular-nums text-foreground">
          {loading ? '...' : count}
        </div>
        <div className="text-xs text-muted-foreground mt-1">Available agent definitions</div>
      </div>
    </div>
  );
};
