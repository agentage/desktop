import { useEffect, useState } from 'react';
import type { WidgetFactory, WidgetInstance } from '../../../shared/types/widget.types.js';

interface ToolsCountResult {
  count: number;
}

/**
 * Tools Statistics Widget
 *
 * Displays the count of available tools in a compact 1x1 format.
 * Clickable to navigate to the Tools page.
 */
const factory: WidgetFactory = (host): WidgetInstance => {
  const { Stack, Text, Icons } = host.components;
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

    const handleClick = (): void => {
      host.navigate('/tools');
    };

    return (
      <button
        onClick={handleClick}
        className="w-full h-full text-left hover:bg-accent/50 transition-colors rounded-lg p-0 border-0 cursor-pointer"
        type="button"
      >
        <Stack spacing="sm" flex={1} justify="center">
          <Icon name="settings" color="violet" size="md" bg />
          <Stack spacing={1}>
            <Text size="2xl" weight="semibold" className="tabular-nums">
              {loading ? '...' : count}
            </Text>
            <Text size="xs" variant="muted">
              Tools
            </Text>
          </Stack>
        </Stack>
      </button>
    );
  };

  return {
    manifest: {
      id: 'tools-stats',
      name: 'Tools',
      description: 'Shows active tools count. Click to manage.',
      size: { w: 1, h: 1 },
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
