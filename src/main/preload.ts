import { contextBridge, ipcRenderer } from 'electron';

// Inline types to avoid import issues in preload context
type OAuthProvider = 'google' | 'github' | 'microsoft';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  verifiedAlias?: string;
}

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface LinkedProvider {
  name: OAuthProvider;
  email: string;
  connectedAt: string;
}

interface LinkProviderResult {
  success: boolean;
  provider?: LinkedProvider;
  providerToken?: string;
  error?: string;
}

interface UnlinkProviderResult {
  success: boolean;
  error?: string;
}

interface ModelProvider {
  id: string;
  provider: 'openai' | 'anthropic' | 'ollama' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  isDefault?: boolean;
}

interface ComposerSettings {
  fontSize: 'small' | 'medium' | 'large';
  iconSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'relaxed';
  accentColor: string;
}

interface Settings {
  models: ModelProvider[];
  backendUrl: string;
  theme: 'light' | 'dark' | 'system';
  defaultModelProvider?: string;
  logRetention: 7 | 30 | 90 | -1;
  language: string;
  composer?: ComposerSettings;
}

interface Workspace {
  id: string;
  name: string;
  path: string;
  isDefault?: boolean;
}

export interface AgentageAPI {
  agents: {
    list: () => Promise<string[]>;
    run: (name: string, prompt: string) => Promise<string>;
  };
  auth: {
    login: () => Promise<AuthResult>;
    logout: () => Promise<{ success: boolean }>;
    getUser: () => Promise<User | null>;
    linkProvider: (provider: OAuthProvider) => Promise<LinkProviderResult>;
    unlinkProvider: (provider: OAuthProvider) => Promise<UnlinkProviderResult>;
    getProviders: () => Promise<LinkedProvider[]>;
  };
  config: {
    get: () => Promise<Record<string, unknown>>;
    set: (key: string, value: unknown) => Promise<void>;
  };
  app: {
    getVersion: () => Promise<string>;
    openExternal: (url: string) => Promise<void>;
    openPath: (path: string) => Promise<void>;
    getConfigDir: () => Promise<string>;
    rendererReady: () => Promise<boolean>;
    quit: () => void;
  };
  settings: {
    get: () => Promise<Settings>;
    update: (updates: Partial<Settings>) => Promise<void>;
    getModelProvider: (id: string) => Promise<ModelProvider | undefined>;
    setModelProvider: (provider: ModelProvider) => Promise<void>;
    removeModelProvider: (id: string) => Promise<void>;
  };
  workspace: {
    list: () => Promise<Workspace[]>;
    getActive: () => Promise<Workspace | null>;
    add: (path: string) => Promise<string>;
    remove: (id: string) => Promise<void>;
    switch: (id: string) => Promise<void>;
    rename: (id: string, name: string) => Promise<void>;
    browse: () => Promise<string | undefined>;
    ensureDefault: () => Promise<void>;
  };
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
  };
}

const api: AgentageAPI = {
  agents: {
    list: () => ipcRenderer.invoke('agents:list'),
    run: (name: string, prompt: string) => ipcRenderer.invoke('agents:run', name, prompt),
  },
  auth: {
    login: () => ipcRenderer.invoke('auth:login'),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getUser: () => ipcRenderer.invoke('auth:getUser'),
    linkProvider: (provider: OAuthProvider) => ipcRenderer.invoke('auth:linkProvider', provider),
    unlinkProvider: (provider: OAuthProvider) =>
      ipcRenderer.invoke('auth:unlinkProvider', provider),
    getProviders: () => ipcRenderer.invoke('auth:getProviders'),
  },
  config: {
    get: () => ipcRenderer.invoke('config:get'),
    set: (key: string, value: unknown) => ipcRenderer.invoke('config:set', key, value),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:version'),
    openExternal: (url: string) => ipcRenderer.invoke('app:openExternal', url),
    openPath: (path: string) => ipcRenderer.invoke('app:openPath', path),
    getConfigDir: () => ipcRenderer.invoke('app:getConfigDir'),
    rendererReady: () => ipcRenderer.invoke('app:rendererReady'),
    quit: () => {
      ipcRenderer.send('app:quit');
    },
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (updates: Partial<Settings>) => ipcRenderer.invoke('settings:update', updates),
    getModelProvider: (id: string) => ipcRenderer.invoke('settings:getModelProvider', id),
    setModelProvider: (provider: ModelProvider) =>
      ipcRenderer.invoke('settings:setModelProvider', provider),
    removeModelProvider: (id: string) => ipcRenderer.invoke('settings:removeModelProvider', id),
  },
  workspace: {
    list: () => ipcRenderer.invoke('workspace:list'),
    getActive: () => ipcRenderer.invoke('workspace:getActive'),
    add: (path: string) => ipcRenderer.invoke('workspace:add', path),
    remove: (id: string) => ipcRenderer.invoke('workspace:remove', id),
    switch: (id: string) => ipcRenderer.invoke('workspace:switch', id),
    rename: (id: string, name: string) => ipcRenderer.invoke('workspace:rename', id, name),
    browse: () => ipcRenderer.invoke('workspace:browse'),
    ensureDefault: () => ipcRenderer.invoke('workspace:ensureDefault'),
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },
};

contextBridge.exposeInMainWorld('agentage', api);

declare global {
  interface Window {
    agentage: AgentageAPI;
  }
}
