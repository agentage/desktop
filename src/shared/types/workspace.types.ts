/**
 * Git status for workspace
 */
export interface WorkspaceGitStatus {
  isGitRepo: boolean;
  isDirty: boolean;
  changedFiles: number;
  branch?: string;
  diff?: string;
}

/**
 * Workspace data model
 */
export interface Workspace {
  id: string;
  name: string;
  path: string;
  icon?: string;
  isDefault?: boolean;
  gitStatus?: WorkspaceGitStatus;
}

/**
 * Partial update for workspace
 */
export interface WorkspaceUpdate {
  name?: string;
  icon?: string;
}

/**
 * Workspace state for store
 */
export interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
}
