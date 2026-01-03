import type { WidgetHost, WidgetHostComponents } from '../../shared/types/widget.types.js';
import * as Icons from '../components/icons.js';
import { IconContainer } from '../components/icon-container.js';

/**
 * Create a widget host instance
 */
export const createWidgetHost = (): WidgetHost => ({
  callTool: async <T = unknown>(toolName: string, params?: unknown): Promise<T> => {
    const result = await window.agentage.widgets.callTool(toolName, params);
    return result as T;
  },
  components: {
    BotIcon: Icons.BotIcon,
    CheckCircleIcon: Icons.CheckCircleIcon,
    SettingsIcon: Icons.SettingsIcon,
    AlertCircleIcon: Icons.AlertCircleIcon,
    IconContainer,
  } as WidgetHostComponents,
});

/**
 * Default widget host instance
 */
export const widgetHost = createWidgetHost();
