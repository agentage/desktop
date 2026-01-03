import { useEffect, useState } from 'react';
import type { WidgetFactory, WidgetInstance } from '../../../shared/types/widget.types.js';

interface ToolsCountResult {
  count: number;
}

/**
 * Tools Statistics Widget
 *
 * Displays the count of available tools with a settings icon.
 * Updates on mount by calling the tools:count tool.
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
          const result = await host.callTool<ToolsCountResult>('tools:count', {});
          setCount(result.count);
        } catch (error) {
          console.error('Failed to fetch tools count:', error);
        } finally {
          setLoading(false);
        }
      };

      void fetchCount();
    }, []);

    return (
      <Stack spacing="md" flex={1}>
        <Flex align="center" gap="sm">
          <Icon name="settings" color="violet" size="sm" bg />
          <Text size="xs" variant="muted">
            Active Tools
          </Text>
        </Flex>
        <Stack spacing={1} flex={1} justify="center">
          <Text size="2xl" weight="semibold" className="tabular-nums">
            {loading ? '...' : count}
          </Text>
          <Text size="xs" variant="muted">
            Available tools
          </Text>
        </Stack>
      </Stack>
    );
  };

  return {
    manifest: {
      id: 'tools-stats',
      name: 'Tools Statistics',
      description: 'Shows active tools count',
      size: { w: 2, h: 1 },
      category: 'system',
    },
    component: Component,
    tools: [
      {
        name: 'tools:count',
        description: 'Get tools count',
        inputSchema: { type: 'object', properties: {} },
      },
    ],
  };
};

export default factory;
