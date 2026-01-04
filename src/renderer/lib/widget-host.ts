import type { WidgetHost, WidgetHostComponents } from '../../shared/types/widget.types.js';
import { IconContainer, Icon } from '../../shared/index.js';
import * as Icons from '../../shared/index.js';
import { Flex } from '../components/layout/Flex.js';
import { Grid } from '../components/layout/Grid.js';
import { Stack } from '../components/layout/Stack.js';
import { Text } from '../components/primitives/Text.js';

/**
 * Create a widget host instance
 */
export const createWidgetHost = (): WidgetHost => ({
  callTool: async <T = unknown>(toolName: string, params?: unknown): Promise<T> => {
    const result = await window.agentage.widgets.callTool(toolName, params);
    return result as T;
  },
  components: {
    // Layout primitives
    Flex,
    Stack,
    Grid,
    // UI primitives
    Text,
    // Icons
    Icons: {
      Icon,
      BotIcon: Icons.BotIcon,
      CheckCircleIcon: Icons.CheckCircleIcon,
      SettingsIcon: Icons.SettingsIcon,
      AlertCircleIcon: Icons.AlertCircleIcon,
      IconContainer,
    },
  } as WidgetHostComponents,
});

/**
 * Default widget host instance
 */
export const widgetHost = createWidgetHost();
