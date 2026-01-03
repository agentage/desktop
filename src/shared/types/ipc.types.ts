import type {
  AuthResult,
  LinkProviderResult,
  LinkedProvider,
  OAuthProvider,
  UnlinkProviderResult,
  User,
} from './auth.types.js';
import type {
  ChatAgentInfo,
  ChatEvent,
  ChatModelInfo,
  ChatSendRequest,
  ChatSendResponse,
  ChatToolInfo,
} from './chat.types.js';
import type { FilesOnlyResponse, FullContextResponse } from './context.types.js';
import type {
  LoadProvidersResult,
  SaveProviderRequest,
  SaveProviderResult,
  ValidateTokenRequest,
  ValidateTokenResponse,
} from './model.providers.types.js';
import type {
  OAuthConnectResult,
  OAuthDisconnectResult,
  OAuthListResult,
  OAuthProviderId,
} from './oauth.types.js';
import type { ToolListResult, ToolSettingsUpdate } from './tools.types.js';
import type { Workspace, WorkspaceUpdate } from './workspace.types.js';

/**
 * Complete IPC channel map for type safety
 * Pattern: {domain}[.subdomain]:{action}
 */
export interface IpcChannelMap {
  // Agents
  'agents:list': () => Promise<string[]>;
  'agents:run': (name: string, prompt: string) => Promise<string>;

  // Auth
  'auth:login': () => Promise<AuthResult>;
  'auth:logout': () => Promise<{ success: boolean }>;
  'auth:getUser': () => Promise<User | null>;
  'auth:linkProvider': (provider: OAuthProvider) => Promise<LinkProviderResult>;
  'auth:unlinkProvider': (provider: OAuthProvider) => Promise<UnlinkProviderResult>;
  'auth:getProviders': () => Promise<LinkedProvider[]>;

  // Chat
  'chat:send': (request: ChatSendRequest) => Promise<ChatSendResponse>;
  'chat:cancel': (requestId: string) => Promise<void>;
  'chat:clear': () => Promise<void>;
  'chat.models:get': () => Promise<ChatModelInfo[]>;
  'chat.tools:get': () => Promise<ChatToolInfo[]>;
  'chat.agents:get': () => Promise<ChatAgentInfo[]>;
  'chat.context:get': (threadId?: string) => Promise<FullContextResponse | FilesOnlyResponse>;

  // Config
  'config:get': () => Promise<Record<string, unknown>>;
  'config:set': (key: string, value: unknown) => Promise<void>;

  // Models
  'models:validate': (request: ValidateTokenRequest) => Promise<ValidateTokenResponse>;
  'models.providers:load': (autoRefresh?: boolean) => Promise<LoadProvidersResult>;
  'models.providers:save': (request: SaveProviderRequest) => Promise<SaveProviderResult>;

  // OAuth
  'oauth:list': () => Promise<OAuthListResult>;
  'oauth:connect': (args: { providerId: OAuthProviderId }) => Promise<OAuthConnectResult>;
  'oauth:disconnect': (args: { providerId: OAuthProviderId }) => Promise<OAuthDisconnectResult>;

  // Settings
  'settings:get': () => Promise<unknown>;
  'settings:update': (updates: unknown) => Promise<void>;

  // Tools
  'tools:list': () => Promise<ToolListResult>;
  'tools:updateSettings': (update: ToolSettingsUpdate) => Promise<void>;

  // Widgets
  'widgets:loadLayout': (layoutId: string) => Promise<unknown>;
  'widgets:saveLayout': (layoutId: string, widgets: unknown[]) => Promise<{ success: boolean }>;
  'widgets:callTool': (toolName: string, params?: unknown) => Promise<unknown>;
  'widgets:listTools': () => Promise<unknown[]>;

  // Workspace
  'workspace:list': () => Promise<Workspace[]>;
  'workspace:getActive': () => Promise<Workspace | null>;
  'workspace:add': (path: string) => Promise<string>;
  'workspace:remove': (id: string) => Promise<void>;
  'workspace:switch': (id: string) => Promise<void>;
  'workspace:update': (id: string, updates: WorkspaceUpdate) => Promise<void>;
  'workspace:browse': () => Promise<string | undefined>;
  'workspace:save': (id: string, message?: string) => Promise<void>;

  // Window
  'window:minimize': () => Promise<void>;
  'window:maximize': () => Promise<void>;
  'window:close': () => Promise<void>;
  'window:isMaximized': () => Promise<boolean>;

  // App
  'app:version': () => Promise<string>;
  'app:openExternal': (url: string) => Promise<void>;
  'app:openPath': (path: string) => Promise<void>;
  'app:getConfigDir': () => Promise<string>;
  'app:rendererReady': () => Promise<boolean>;
  'app:quit': () => void;
}

/**
 * IPC event map for type safety
 * Pattern: {domain}[.subdomain]:changed
 */
export interface IpcEventMap {
  'chat:event': (event: ChatEvent) => void;
  'models:changed': (models: ChatModelInfo[]) => void;
  'tools:changed': (enabledTools: string[]) => void;
  'workspace:changed': () => void;
}

// Legacy types for backward compatibility
export interface RunResult {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
}

export interface AppState {
  selectedAgent: string | null;
  isRunning: boolean;
  lastOutput: string | null;
}

// Re-export for convenience
export type { IpcChannelMap as IpcChannels };
