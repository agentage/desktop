/**
 * Workspace data model
 */
export interface Workspace {
  id: string;
  name: string;
  path: string;
  isDefault?: boolean;
}

/**
 * Workspace state for store
 */
export interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
}
