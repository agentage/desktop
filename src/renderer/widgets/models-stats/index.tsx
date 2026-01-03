import { useEffect, useState } from 'react';
import type { WidgetFactory, WidgetInstance } from '../../../shared/types/widget.types.js';

interface ModelsCountResult {
  count: number;
}

/**
 * Models Statistics Widget
 *
 * Displays the count of available AI models with a cube icon.
 * Updates on mount by calling the models:count tool.
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
          const result = await host.callTool<ModelsCountResult>('models:count', {});
          setCount(result.count);
        } catch (error) {
          console.error('Failed to fetch models count:', error);
        } finally {
          setLoading(false);
        }
      };

      void fetchCount();
    }, []);

    return (
      <Stack spacing="md" flex={1}>
        <Flex align="center" gap="sm">
          <Icon name="cube" color="cyan" size="sm" bg />
          <Text size="xs" variant="muted">
            AI Models
          </Text>
        </Flex>
        <Stack spacing={1} flex={1} justify="center">
          <Text size="2xl" weight="semibold" className="tabular-nums">
            {loading ? '...' : count}
          </Text>
          <Text size="xs" variant="muted">
            Available models
          </Text>
        </Stack>
      </Stack>
    );
  };

  return {
    manifest: {
      id: 'models-stats',
      name: 'Models Statistics',
      description: 'Shows available AI models count',
      size: { w: 2, h: 1 },
      category: 'system',
    },
    component: Component,
    tools: [
      {
        name: 'models:count',
        description: 'Get models count',
        inputSchema: { type: 'object', properties: {} },
      },
    ],
  };
};

export default factory;
