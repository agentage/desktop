import { useEffect, useState } from 'react';
import type { WidgetComponentProps } from '../../../shared/types/widget.types.js';

interface AgentCountResult {
  count: number;
}

export const AgentStatsComponent = ({ host }: WidgetComponentProps): React.JSX.Element => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const { BotIcon, IconContainer } = host.components;

  useEffect(() => {
    const fetchCount = async (): Promise<void> => {
      try {
        const result = await host.callTool<AgentCountResult>('agents:count', {});
        setCount(result.count);
      } catch (error) {
        console.error('Failed to fetch agent count:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchCount();
  }, [host]);

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
