import { randomUUID } from 'crypto';
import type { BrowserWindow } from 'electron';
import { app, dialog } from 'electron';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { basename, join } from 'path';
import simpleGit, { type SimpleGit } from 'simple-git';
import { workspacesSchema } from '../../shared/schemas/workspace.schema.js';
import type {
  Workspace,
  WorkspaceGitStatus,
  WorkspaceState,
} from '../../shared/types/workspace.types.js';
import { loadConfig } from './config.service.js';

// Store reference to main window for sending events
let mainWindow: BrowserWindow | null = null;

export const setMainWindow = (window: BrowserWindow | null): void => {
  mainWindow = window;
};

/**
 * Notify renderer of workspace changes
 */
const notifyWorkspaceChanged = (): void => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('workspace:changed');
  }
};

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
 * Get default workspace path for user
 */
const getDefaultWorkspacePath = async (): Promise<string> => {
  const config = await loadConfig();
  const userId = config.auth?.user?.id ?? 'default';
  return join(app.getPath('home'), '.agentage', userId, 'default');
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
 * Get git status for a workspace path
 */
const getGitStatus = async (workspacePath: string): Promise<WorkspaceGitStatus> => {
  try {
    const git: SimpleGit = simpleGit(workspacePath);
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return { isGitRepo: false, isDirty: false, changedFiles: 0 };
    }

    const status = await git.status();
    return {
      isGitRepo: true,
      isDirty: !status.isClean(),
      changedFiles: status.files.length,
      branch: status.current ?? undefined,
    };
  } catch {
    return { isGitRepo: false, isDirty: false, changedFiles: 0 };
  }
};

/**
 * List all workspaces with git status
 */
export const listWorkspaces = async (): Promise<Workspace[]> => {
  const state = await loadWorkspaceState();

  // Fetch git status for each workspace
  const workspacesWithStatus = await Promise.all(
    state.workspaces.map(async (w) => ({
      ...w,
      gitStatus: await getGitStatus(w.path),
    }))
  );

  return workspacesWithStatus;
};

/**
 * Get active workspace with git status
 */
export const getActiveWorkspace = async (): Promise<Workspace | null> => {
  const state = await loadWorkspaceState();
  if (!state.activeWorkspaceId) return null;

  const workspace = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
  if (!workspace) return null;

  return {
    ...workspace,
    gitStatus: await getGitStatus(workspace.path),
  };
};

/**
 * Initialize git in a directory
 */
const initGit = async (path: string): Promise<void> => {
  const git: SimpleGit = simpleGit(path);
  await git.init();

  // Create initial agentage.json
  const agentageJson = join(path, 'agentage.json');
  await writeFile(agentageJson, JSON.stringify({ version: '1.0.0' }, null, 2), 'utf-8');

  // Initial commit
  await git.add('.');
  await git.commit('Initial commit');
};

/**
 * Add a new workspace (with git init)
 */
export const addWorkspace = async (path: string, initializeGit = true): Promise<string> => {
  const state = await loadWorkspaceState();
  const id = randomUUID();
  const name = basename(path);

  // Initialize git if requested
  if (initializeGit) {
    const git: SimpleGit = simpleGit(path);
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      await initGit(path);
    }
  }

  const workspace: Workspace = { id, name, path };
  state.workspaces.push(workspace);

  // Set as active if first workspace
  if (state.workspaces.length === 1) {
    state.activeWorkspaceId = id;
  }

  await saveWorkspaceState(state);
  notifyWorkspaceChanged();
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
  notifyWorkspaceChanged();
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
  notifyWorkspaceChanged();
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
  notifyWorkspaceChanged();
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
 * Get git diff for a workspace
 */
export const getWorkspaceDiff = async (id: string): Promise<string> => {
  const state = await loadWorkspaceState();
  const workspace = state.workspaces.find((w) => w.id === id);

  if (!workspace) {
    throw new Error(`Workspace ${id} not found`);
  }

  const git: SimpleGit = simpleGit(workspace.path);
  const isRepo = await git.checkIsRepo();

  if (!isRepo) {
    return '';
  }

  // Get diff of all changes (staged and unstaged)
  const diff = await git.diff();
  const stagedDiff = await git.diff(['--cached']);

  return stagedDiff + diff;
};

/**
 * Save (commit and optionally push) workspace changes
 */
export const saveWorkspace = async (id: string, message?: string): Promise<void> => {
  const state = await loadWorkspaceState();
  const workspace = state.workspaces.find((w) => w.id === id);

  if (!workspace) {
    throw new Error(`Workspace ${id} not found`);
  }

  const git: SimpleGit = simpleGit(workspace.path);
  const isRepo = await git.checkIsRepo();

  if (!isRepo) {
    throw new Error('Workspace is not a git repository');
  }

  const status = await git.status();
  if (status.isClean()) {
    return; // Nothing to commit
  }

  // Stage all changes and commit
  await git.add('.');
  const commitMessage = message ?? `Save: ${new Date().toISOString()}`;
  await git.commit(commitMessage);

  // Try to push if remote exists
  try {
    const remotes = await git.getRemotes();
    if (remotes.length > 0) {
      await git.push();
    }
  } catch {
    // Push failed, but commit succeeded - that's ok for local-only repos
  }

  notifyWorkspaceChanged();
};

/**
 * Create default workspace on first login
 */
export const ensureDefaultWorkspace = async (): Promise<void> => {
  const state = await loadWorkspaceState();

  if (state.workspaces.length === 0) {
    const defaultPath = await getDefaultWorkspacePath();

    // Create directory
    await mkdir(defaultPath, { recursive: true });

    // Initialize git with agentage.json
    await initGit(defaultPath);

    const workspace: Workspace = {
      id: 'default',
      name: 'My Workspace',
      path: defaultPath,
      isDefault: true,
    };

    state.workspaces.push(workspace);
    state.activeWorkspaceId = 'default';
    await saveWorkspaceState(state);
    notifyWorkspaceChanged();
  }
};
