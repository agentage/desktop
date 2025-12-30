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
  icon?: string;
  color?: string;
  isDefault?: boolean;
  gitStatus?: {
    isGitRepo: boolean;
    isDirty: boolean;
    changedFiles: number;
    branch?: string;
    diff?: string;
  };
}

interface WorkspaceUpdate {
  name?: string;
  icon?: string;
  color?: string;
}

// Keys management types
type KeyProvider = 'anthropic' | 'openai';

interface ValidateKeyRequest {
  provider: KeyProvider;
  key: string;
}

interface ValidateKeyResponse {
  valid: boolean;
  models?: string[];
  error?: 'invalid_key' | 'network_error';
}

interface ProviderKeyConfig {
  provider: KeyProvider;
  key: string;
  enabledModels: string[];
}

interface AutodiscoverResult {
  anthropic?: string;
  openai?: string;
}

interface LoadKeysResult {
  providers: ProviderKeyConfig[];
}

interface SaveKeyResult {
  success: boolean;
  error?: string;
}

// OAuth types
interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scopes: string[];
}

interface OAuthAuthorizeResult {
  success: boolean;
  tokens?: OAuthTokens;
  error?: string;
}

interface CreateApiKeyResult {
  success: boolean;
  apiKey?: string;
  error?: string;
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
  keys: {
    autodiscover: () => Promise<AutodiscoverResult>;
    validate: (request: ValidateKeyRequest) => Promise<ValidateKeyResponse>;
    save: (config: ProviderKeyConfig) => Promise<SaveKeyResult>;
    load: () => Promise<LoadKeysResult>;
  };
  oauth: {
    getExistingTokens: () => Promise<OAuthAuthorizeResult>;
    authorize: () => Promise<OAuthAuthorizeResult>;
    createApiKey: (accessToken: string, name?: string) => Promise<CreateApiKeyResult>;
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
    update: (id: string, updates: WorkspaceUpdate) => Promise<void>;
    browse: () => Promise<string | undefined>;
    save: (id: string, message?: string) => Promise<void>;
    onListChanged: (callback: () => void) => () => void;
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
  keys: {
    autodiscover: () => ipcRenderer.invoke('keys:autodiscover'),
    validate: (request: ValidateKeyRequest) => ipcRenderer.invoke('keys:validate', request),
    save: (config: ProviderKeyConfig) => ipcRenderer.invoke('keys:save', config),
    load: () => ipcRenderer.invoke('keys:load'),
  },
  oauth: {
    getExistingTokens: () => ipcRenderer.invoke('oauth:getExistingTokens'),
    authorize: () => ipcRenderer.invoke('oauth:authorize'),
    createApiKey: (accessToken: string, name?: string) =>
      ipcRenderer.invoke('oauth:createApiKey', accessToken, name),
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
    update: (id: string, updates: WorkspaceUpdate) =>
      ipcRenderer.invoke('workspace:update', id, updates),
    browse: () => ipcRenderer.invoke('workspace:browse'),
    save: (id: string, message?: string) => ipcRenderer.invoke('workspace:save', id, message),
    onListChanged: (callback: () => void) => {
      const handler = (): void => {
        callback();
      };
      ipcRenderer.on('workspace:listChanged', handler);
      return () => {
        ipcRenderer.removeListener('workspace:listChanged', handler);
      };
    },
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
