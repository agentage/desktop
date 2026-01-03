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
 * Icon container color options
 */
export type WidgetIconContainerColor =
  | 'blue'
  | 'green'
  | 'amber'
  | 'violet'
  | 'rose'
  | 'cyan'
  | 'muted';

/**
 * Icon container size options
 */
export type WidgetIconContainerSize = 'sm' | 'md' | 'lg';

/**
 * Widget host components - UI components available to widgets
 */
export interface WidgetHostComponents {
  // Layout primitives
  Flex: React.FC<{
    direction?: 'row' | 'column';
    gap?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    wrap?: boolean;
    flex?: number;
    className?: string;
    children: React.ReactNode;
  }>;
  Stack: React.FC<{
    direction?: 'horizontal' | 'vertical';
    spacing?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    flex?: number;
    className?: string;
    children: React.ReactNode;
  }>;
  Grid: React.FC<{
    columns?: number | string;
    rows?: string;
    gap?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    children: React.ReactNode;
  }>;
  // UI primitives
  Text: React.FC<{
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    variant?: 'default' | 'muted' | 'primary' | 'destructive';
    align?: 'left' | 'center' | 'right';
    truncate?: boolean;
    className?: string;
    children: React.ReactNode;
  }>;
  // Icons
  Icons: {
    Icon: React.FC<{
      name: string;
      size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      color?: 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'cyan' | 'muted';
      bg?: boolean;
      className?: string;
    }>;
    BotIcon: React.FC;
    CheckCircleIcon: React.FC;
    SettingsIcon: React.FC;
    AlertCircleIcon: React.FC;
    IconContainer: React.FC<{
      color: WidgetIconContainerColor;
      size?: WidgetIconContainerSize;
      children: React.ReactNode;
      className?: string;
    }>;
  };
}

/**
 * Widget host interface - provides widgets with access to tools and components
 */
export interface WidgetHost {
  /** Call a widget tool by name */
  callTool: <T = unknown>(toolName: string, params?: unknown) => Promise<T>;
  /** Navigate to a specific route */
  navigate: (path: string) => void;
  /** UI components available to widgets */
  components: WidgetHostComponents;
}

/**
 * Widget component props - passed to widget components
 */
export interface WidgetComponentProps {
  host: WidgetHost;
}

/**
 * Widget instance - complete widget with component and tools
 */
export interface WidgetInstance {
  manifest: WidgetManifest;
  component: React.ComponentType<WidgetComponentProps>;
  tools: ToolDefinition[];
}

/**
 * Widget factory function - creates a widget with access to host
 */
export type WidgetFactory = (host: WidgetHost) => WidgetInstance;

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
