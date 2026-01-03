/**
 * Widget System Types
 *
 * Core interfaces for the widget system that provides modular UI components
 * with tool-based AI agent interaction capabilities.
 */

/**
 * Tool definition for widget tools
 * Defines the interface for tools that widgets can expose
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * Widget manifest - metadata about a widget
 */
export interface WidgetManifest {
  id: string;
  name: string;
  description: string;
  size: { w: number; h: number };
  category: 'system' | 'productivity' | 'integration' | 'custom';
}

/**
 * Widget instance - complete widget with component and tools
 */
export interface WidgetInstance {
  manifest: WidgetManifest;
  component: React.ComponentType;
  tools: ToolDefinition[];
}

/**
 * Widget placement in a layout
 */
export interface WidgetPlacement {
  id: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
}

/**
 * Layout definition
 */
export interface Layout {
  name: string;
  grid: { columns: number; rowHeight: number };
  widgets: WidgetPlacement[];
}

/**
 * Layout configuration file structure
 */
export interface LayoutConfig {
  version: string;
  layouts: Record<string, Layout>;
}

/**
 * Widgets registry configuration
 */
export interface WidgetsConfig {
  version: string;
  widgets: Record<string, { enabled: boolean }>;
}

/**
 * Result of loading a layout
 */
export interface LoadLayoutResult {
  layout: Layout;
}
