import { z } from 'zod';

/**
 * Tool definition schema
 */
export const toolDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.object({
    type: z.literal('object'),
    properties: z.record(z.string(), z.unknown()),
    required: z.array(z.string()).optional(),
  }),
});

/**
 * Widget manifest schema
 */
export const widgetManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  size: z.object({
    w: z.number().positive(),
    h: z.number().positive(),
  }),
  category: z.enum(['system', 'productivity', 'integration', 'custom']),
});

/**
 * Widget placement schema
 */
export const widgetPlacementSchema = z.object({
  id: z.string(),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
  }),
  size: z.object({
    w: z.number().positive(),
    h: z.number().positive(),
  }),
});

/**
 * Layout schema
 */
export const layoutSchema = z.object({
  name: z.string(),
  grid: z.object({
    columns: z.number().positive(),
    rowHeight: z.number().positive(),
  }),
  widgets: z.array(widgetPlacementSchema),
});

/**
 * Layout config file schema
 */
export const layoutConfigSchema = z.object({
  version: z.string(),
  layouts: z.record(z.string(), layoutSchema),
});

/**
 * Widgets config file schema
 */
export const widgetsConfigSchema = z.object({
  version: z.string(),
  widgets: z.record(z.string(), z.object({ enabled: z.boolean() })),
});

export type ToolDefinitionSchema = z.infer<typeof toolDefinitionSchema>;
export type WidgetManifestSchema = z.infer<typeof widgetManifestSchema>;
export type WidgetPlacementSchema = z.infer<typeof widgetPlacementSchema>;
export type LayoutSchema = z.infer<typeof layoutSchema>;
export type LayoutConfigSchema = z.infer<typeof layoutConfigSchema>;
export type WidgetsConfigSchema = z.infer<typeof widgetsConfigSchema>;
