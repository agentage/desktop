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

// Model providers types
type ModelProviderType = 'anthropic' | 'openai';

interface ValidateTokenRequest {
  provider: ModelProviderType;
  token: string;
}

interface ModelInfo {
  id: string;
  displayName: string;
  createdAt?: string;
  enabled: boolean;
  isDefault?: boolean;
}

interface ValidateTokenResponse {
  valid: boolean;
  models?: ModelInfo[];
  error?: 'invalid_token' | 'network_error';
}

interface ModelProviderConfig {
  provider: ModelProviderType;
  token: string;
  enabled: boolean;
  lastFetchedAt?: string;
  models: ModelInfo[];
}

interface SaveProviderRequest {
  provider: ModelProviderType;
  token: string;
  enabled: boolean;
  lastFetchedAt?: string;
  models: ModelInfo[];
}

interface LoadProvidersResult {
  providers: ModelProviderConfig[];
}

interface SaveProviderResult {
  success: boolean;
  error?: string;
}

// OAuth Connect types
type OAuthProviderId = 'openai' | 'anthropic';

interface OAuthProfile {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
}

interface OAuthProviderStatus {
  id: OAuthProviderId;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  profile?: OAuthProfile;
  expiresAt?: number;
  isExpired?: boolean;
}

interface OAuthListResult {
  providers: OAuthProviderStatus[];
}

interface OAuthConnectResult {
  success: boolean;
  profile?: OAuthProfile;
  error?: string;
}

interface OAuthDisconnectResult {
  success: boolean;
  error?: string;
}

// Tools types
type ToolSource = 'builtin' | 'global' | 'workspace';
type ToolStatus = 'ready' | 'warning' | 'error';

interface ToolInfo {
  name: string;
  description: string;
  source: ToolSource;
  status: ToolStatus;
}

interface ToolSettings {
  enabledTools: string[];
}

interface ToolListResult {
  tools: ToolInfo[];
  settings: ToolSettings;
}

interface ToolSettingsUpdate {
  enabledTools: string[];
}

// Chat types
interface ChatModelOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

interface SessionConfig {
  conversationId?: string;
  model: string;
  system?: string;
  agent?: string;
  tools?: string[];
  options?: ChatModelOptions;
}

interface ChatReference {
  type: 'file' | 'selection' | 'image';
  uri: string;
  content?: string;
  range?: { start: number; end: number };
}

interface ChatSendRequest {
  prompt: string;
  references?: ChatReference[];
  config: SessionConfig;
}

interface ChatSendResponse {
  requestId: string;
  conversationId: string;
}

interface ChatModelInfo {
  id: string;
  name: string;
  provider: ModelProviderType;
  contextWindow: number;
  capabilities?: string[];
}

interface ChatToolInfo {
  id: string;
  name: string;
  description: string;
}

interface ChatAgentInfo {
  id: string;
  name: string;
  description: string;
  defaultModel?: string;
  defaultTools?: string[];
}

type ChatStopReason = 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence';

type ChatErrorCode =
  | 'AUTH_ERROR'
  | 'RATE_LIMIT'
  | 'MODEL_UNAVAILABLE'
  | 'CONTEXT_LENGTH'
  | 'CANCELLED'
  | 'NETWORK_ERROR'
  | 'TOOL_ERROR'
  | 'INTERNAL_ERROR';

type ChatStreamEvent =
  | { type: 'text'; text: string }
  | { type: 'thinking'; text: string }
  | { type: 'tool_call'; toolCallId: string; name: string; input: unknown }
  | { type: 'tool_result'; toolCallId: string; name: string; result: unknown; isError?: boolean }
  | { type: 'usage'; inputTokens: number; outputTokens: number }
  | { type: 'done'; stopReason: ChatStopReason }
  | {
      type: 'error';
      code: ChatErrorCode;
      message: string;
      recoverable: boolean;
      retryAfter?: number;
    };

type ChatEvent = { requestId: string } & ChatStreamEvent;

interface ChatAPI {
  send: (request: ChatSendRequest) => Promise<ChatSendResponse>;
  cancel: (requestId: string) => void;
  onEvent: (callback: (event: ChatEvent) => void) => () => void;
  getModels: () => Promise<ChatModelInfo[]>;
  getTools: () => Promise<ChatToolInfo[]>;
  getAgents: () => Promise<ChatAgentInfo[]>;
  clear: () => void;
  context: {
    get: (threadId?: string) => Promise<ContextResponse>;
  };
}

// Context types
interface ContextItem {
  name: string;
  tokens: number;
  percentage: number;
  color: string;
}

interface ContextBreakdownData {
  currentContext: number;
  maxContext: number;
  items: ContextItem[];
  agentageFiles?: { path: string; tokens: number }[];
  timestamp: string;
}

interface ContextFileInfo {
  path: string;
  exists: boolean;
  tokens: number;
  lastModified: string | null;
  content?: string;
}

interface FullContextResponse {
  threadId: string;
  breakdown: ContextBreakdownData;
  files: {
    global: ContextFileInfo;
    project: ContextFileInfo | null;
  };
}

interface FilesOnlyResponse {
  files: {
    global: ContextFileInfo;
    project: ContextFileInfo | null;
  };
}

type ContextResponse = FullContextResponse | FilesOnlyResponse;

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
  models: {
    providers: {
      load: (autoRefresh?: boolean) => Promise<LoadProvidersResult>;
      save: (request: SaveProviderRequest) => Promise<SaveProviderResult>;
    };
    validate: (request: ValidateTokenRequest) => Promise<ValidateTokenResponse>;
    onChange: (callback: (models: ChatModelInfo[]) => void) => () => void;
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
  chat: ChatAPI;
  oauth: {
    list: () => Promise<OAuthListResult>;
    connect: (providerId: OAuthProviderId) => Promise<OAuthConnectResult>;
    disconnect: (providerId: OAuthProviderId) => Promise<OAuthDisconnectResult>;
  };
  tools: {
    list: () => Promise<ToolListResult>;
    updateSettings: (update: ToolSettingsUpdate) => Promise<void>;
    onChange: (callback: (enabledTools: string[]) => void) => () => void;
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
  models: {
    providers: {
      load: (autoRefresh?: boolean) => ipcRenderer.invoke('models:providers:load', autoRefresh),
      save: (request: SaveProviderRequest) => ipcRenderer.invoke('models:providers:save', request),
    },
    validate: (request: ValidateTokenRequest) => ipcRenderer.invoke('models:validate', request),
    onChange: (callback: (models: ChatModelInfo[]) => void) => {
      const handler = (_event: unknown, models: ChatModelInfo[]): void => {
        callback(models);
      };
      ipcRenderer.on('models:change', handler);
      return () => {
        ipcRenderer.removeListener('models:change', handler);
      };
    },
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
  chat: {
    send: (request: ChatSendRequest) => ipcRenderer.invoke('chat:send', request),
    cancel: (requestId: string) => {
      void ipcRenderer.invoke('chat:cancel', requestId);
    },
    onEvent: (callback: (event: ChatEvent) => void) => {
      const handler = (_event: unknown, chatEvent: ChatEvent): void => {
        callback(chatEvent);
      };
      ipcRenderer.on('chat:event', handler);
      return () => {
        ipcRenderer.removeListener('chat:event', handler);
      };
    },
    getModels: () => ipcRenderer.invoke('chat:getModels'),
    getTools: () => ipcRenderer.invoke('chat:getTools'),
    getAgents: () => ipcRenderer.invoke('chat:getAgents'),
    clear: () => {
      void ipcRenderer.invoke('chat:clear');
    },
    context: {
      get: (threadId?: string) => ipcRenderer.invoke('chat:context:get', threadId),
    },
  },
  oauth: {
    list: () => ipcRenderer.invoke('oauth:list'),
    connect: (providerId: OAuthProviderId) => ipcRenderer.invoke('oauth:connect', { providerId }),
    disconnect: (providerId: OAuthProviderId) =>
      ipcRenderer.invoke('oauth:disconnect', { providerId }),
  },
  tools: {
    list: () => ipcRenderer.invoke('tools:list'),
    updateSettings: (update: ToolSettingsUpdate) =>
      ipcRenderer.invoke('tools:updateSettings', update),
    onChange: (callback: (enabledTools: string[]) => void) => {
      const handler = (_event: unknown, tools: string[]): void => {
        callback(tools);
      };
      ipcRenderer.on('tools:change', handler);
      return () => {
        ipcRenderer.removeListener('tools:change', handler);
      };
    },
  },
};

contextBridge.exposeInMainWorld('agentage', api);

declare global {
  interface Window {
    agentage: AgentageAPI;
  }
}
