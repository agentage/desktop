import { randomUUID } from 'crypto';
import { app, dialog } from 'electron';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { basename, join } from 'path';
import { workspacesSchema } from '../../shared/schemas/workspace.schema.js';
import type { Workspace, WorkspaceState } from '../../shared/types/workspace.types.js';
import { loadConfig } from './config.service.js';

/**
 * Get workspaces file path for current user
 * Path: ~/.agentage/{userId}/workspaces.json
 */
const getWorkspacesPath = async (): Promise<string> => {
  const config = await loadConfig();
  const userId = config.auth?.user?.id ?? 'default';
  const configDir = join(app.getPath('home'), '.agentage', userId);
  await mkdir(configDir, { recursive: true });
  return join(configDir, 'workspaces.json');
};

/**
 * Load workspace state from file
 */
const loadWorkspaceState = async (): Promise<WorkspaceState> => {
  try {
    const filePath = await getWorkspacesPath();
    const content = await readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content) as WorkspaceState;
    const workspaces = workspacesSchema.parse(parsed.workspaces);
    return {
      workspaces,
      activeWorkspaceId: parsed.activeWorkspaceId ?? null,
    };
  } catch {
    return { workspaces: [], activeWorkspaceId: null };
  }
};

/**
 * Save workspace state to file
 */
const saveWorkspaceState = async (state: WorkspaceState): Promise<void> => {
  const filePath = await getWorkspacesPath();
  await writeFile(filePath, JSON.stringify(state, null, 2), 'utf-8');
};

/**
 * List all workspaces
 */
export const listWorkspaces = async (): Promise<Workspace[]> => {
  const state = await loadWorkspaceState();
  return state.workspaces;
};

/**
 * Get active workspace
 */
export const getActiveWorkspace = async (): Promise<Workspace | null> => {
  const state = await loadWorkspaceState();
  if (!state.activeWorkspaceId) return null;
  return state.workspaces.find((w) => w.id === state.activeWorkspaceId) ?? null;
};

/**
 * Add a new workspace
 */
export const addWorkspace = async (path: string): Promise<string> => {
  const state = await loadWorkspaceState();
  const id = randomUUID();
  const name = basename(path);

  const workspace: Workspace = { id, name, path };
  state.workspaces.push(workspace);

  // Set as active if first workspace
  if (state.workspaces.length === 1) {
    state.activeWorkspaceId = id;
  }

  await saveWorkspaceState(state);
  return id;
};

/**
 * Remove a workspace
 */
export const removeWorkspace = async (id: string): Promise<void> => {
  const state = await loadWorkspaceState();
  const workspace = state.workspaces.find((w) => w.id === id);

  // Don't allow removing default workspace
  if (workspace?.isDefault) {
    throw new Error('Cannot remove default workspace');
  }

  state.workspaces = state.workspaces.filter((w) => w.id !== id);

  // If removing active workspace, switch to first available
  if (state.activeWorkspaceId === id) {
    state.activeWorkspaceId = state.workspaces[0]?.id ?? null;
  }

  await saveWorkspaceState(state);
};

/**
 * Switch active workspace
 */
export const switchWorkspace = async (id: string): Promise<void> => {
  const state = await loadWorkspaceState();
  const exists = state.workspaces.some((w) => w.id === id);

  if (!exists) {
    throw new Error(`Workspace ${id} not found`);
  }

  state.activeWorkspaceId = id;
  await saveWorkspaceState(state);
};

/**
 * Rename a workspace
 */
export const renameWorkspace = async (id: string, name: string): Promise<void> => {
  const state = await loadWorkspaceState();
  const workspace = state.workspaces.find((w) => w.id === id);

  if (!workspace) {
    throw new Error(`Workspace ${id} not found`);
  }

  workspace.name = name;
  await saveWorkspaceState(state);
};

/**
 * Browse for folder using native dialog
 */
export const browseWorkspaceFolder = async (): Promise<string | undefined> => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select Workspace Folder',
  });
  return filePaths[0];
};

/**
 * Create default workspace on first login
 */
export const ensureDefaultWorkspace = async (): Promise<void> => {
  const state = await loadWorkspaceState();

  if (state.workspaces.length === 0) {
    const config = await loadConfig();
    const userId = config.auth?.user?.id ?? 'default';
    const defaultPath = join(app.getPath('documents'), 'Agentage', userId, 'default');

    await mkdir(defaultPath, { recursive: true });

    const workspace: Workspace = {
      id: 'default',
      name: 'My Workspace',
      path: defaultPath,
      isDefault: true,
    };

    state.workspaces.push(workspace);
    state.activeWorkspaceId = 'default';
    await saveWorkspaceState(state);
  }
};
