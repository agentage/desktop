import type { WidgetHost, WidgetHostComponents } from '../../shared/types/widget.types.js';
import { IconContainer } from '../components/icon-container.js';
import * as Icons from '../components/icons.js';
import { Flex } from '../components/layout/Flex.js';
import { Grid } from '../components/layout/Grid.js';
import { Stack } from '../components/layout/Stack.js';
import { Icon } from '../components/primitives/Icon.js';
import { Text } from '../components/primitives/Text.js';

/**
 * Create a widget host instance
 */
export const createWidgetHost = (
  navigate?: (path: string) => void | Promise<void>
): WidgetHost => ({
  callTool: async <T = unknown>(toolName: string, params?: unknown): Promise<T> => {
    const result = await window.agentage.widgets.callTool(toolName, params);
    return result as T;
  },
  navigate: (path: string): void => {
    if (navigate) {
      const result = navigate(path);
      if (result instanceof Promise) {
        void result;
      }
    } else {
      console.warn('Navigation not available in widget host');
    }
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
 * Note: This is created without navigation capability.
 * Pages that need navigation should create their own host with createWidgetHost(navigate).
 */
export const widgetHost = createWidgetHost();
