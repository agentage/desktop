import { useEffect, useState } from 'react';
import type { WidgetFactory, WidgetInstance } from '../../../shared/types/widget.types.js';

interface ConnectionsCountResult {
  count: number;
}

/**
 * Connections Statistics Widget
 *
 * Displays the count of active connections with a plug icon.
 * Updates on mount by calling the connections:count tool.
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
          const result = await host.callTool<ConnectionsCountResult>('connections:count', {});
          setCount(result.count);
        } catch (error) {
          console.error('Failed to fetch connections count:', error);
        } finally {
          setLoading(false);
        }
      };

      void fetchCount();
    }, []);

    return (
      <Stack spacing="md" flex={1}>
        <Flex align="center" gap="sm">
          <Icon name="plug" color="green" size="sm" bg />
          <Text size="xs" variant="muted">
            Connections
          </Text>
        </Flex>
        <Stack spacing={1} flex={1} justify="center">
          <Text size="2xl" weight="semibold" className="tabular-nums">
            {loading ? '...' : count}
          </Text>
          <Text size="xs" variant="muted">
            Active connections
          </Text>
        </Stack>
      </Stack>
    );
  };

  return {
    manifest: {
      id: 'connections-stats',
      name: 'Connections Statistics',
      description: 'Shows active connections count',
      size: { w: 2, h: 1 },
      category: 'system',
    },
    component: Component,
    tools: [
      {
        name: 'connections:count',
        description: 'Get connections count',
        inputSchema: { type: 'object', properties: {} },
      },
    ],
  };
};

export default factory;
