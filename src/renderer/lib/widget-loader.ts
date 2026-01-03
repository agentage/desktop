import type { WidgetInstance } from '../../shared/types/widget.types.js';

/**
 * Registry of bundled widgets with lazy loading
 * Add new widgets here to make them available in the app
 */
const WIDGET_LOADERS: Record<string, () => Promise<WidgetInstance>> = {
  'agent-stats': () => import('../widgets/agent-stats/index.js'),
};

/**
 * Load a widget by ID
 * Returns null if the widget is not found
 */
export const loadWidget = async (widgetId: string): Promise<WidgetInstance | null> => {
  const loader = WIDGET_LOADERS[widgetId] as (() => Promise<WidgetInstance>) | undefined;
  if (!loader) return null;
  return loader();
};

/**
 * Check if a widget exists
 */
export const hasWidget = (widgetId: string): boolean => widgetId in WIDGET_LOADERS;

/**
 * Get list of available widget IDs
 */
export const getAvailableWidgetIds = (): string[] => Object.keys(WIDGET_LOADERS);
