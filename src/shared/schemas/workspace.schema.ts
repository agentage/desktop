import { z } from 'zod';

/**
 * Workspace schema for validation
 */
export const workspaceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  path: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().optional(),
  isDefault: z.boolean().optional(),
});

/**
 * Workspace list schema
 */
export const workspacesSchema = z.array(workspaceSchema);

export type WorkspaceSchema = z.infer<typeof workspaceSchema>;
