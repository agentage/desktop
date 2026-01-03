import { useEffect, useState } from 'react';
import type { WidgetFactory, WidgetInstance } from '../../../shared/types/widget.types.js';

interface AgentCountResult {
  count: number;
}

/**
 * Agent Statistics Widget
 *
 * Displays the count of available agent definitions with a bot icon.
 * Updates on mount by calling the agents:count tool.
 */
const factory: WidgetFactory = (host): WidgetInstance => {
  const { Flex, Stack, Text, Icons } = host.components;
  const { Icon } = Icons;

  const Component = (): React.JSX.Element => {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

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
    }, []);

    return (
      <Stack spacing="md" flex={1}>
        <Flex align="center" gap="sm">
          <Icon name="bot" color="blue" size="sm" bg />
          <Text size="xs" variant="muted">
            Active Agents
          </Text>
        </Flex>
        <Stack spacing={1} flex={1} justify="center">
          <Text size="2xl" weight="semibold" className="tabular-nums">
            {loading ? '...' : count}
          </Text>
          <Text size="xs" variant="muted">
            Available agent definitions
          </Text>
        </Stack>
      </Stack>
    );
  };

  return {
    manifest: {
      id: 'agent-stats',
      name: 'Agent Statistics',
      description: 'Shows active agents count',
      size: { w: 2, h: 1 },
      category: 'system',
    },
    component: Component,
    tools: [
      {
        name: 'agents:count',
        description: 'Get agent count',
        inputSchema: { type: 'object', properties: {} },
      },
    ],
  };
};

export default factory;
