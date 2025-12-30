/**
 * Git status for workspace
 */
export interface WorkspaceGitStatus {
  isGitRepo: boolean;
  isDirty: boolean;
  changedFiles: number;
  branch?: string;
}

/**
 * Workspace data model
 */
export interface Workspace {
  id: string;
  name: string;
  path: string;
  isDefault?: boolean;
  gitStatus?: WorkspaceGitStatus;
}

/**
 * Workspace state for store
 */
export interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
}
