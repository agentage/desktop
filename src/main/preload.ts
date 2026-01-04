import { contextBridge, ipcRenderer } from 'electron';
import type {
  AuthResult,
  LinkedProvider,
  LinkProviderResult,
  OAuthProvider,
  UnlinkProviderResult,
  User,
} from '../shared/types/auth.types.js';
import type {
  ChatAgentInfo,
  ChatEvent,
  ChatMessage,
  ChatModelInfo,
  ChatSendRequest,
  ChatSendResponse,
  ChatToolInfo,
} from '../shared/types/chat.types.js';
import type {
  FilesOnlyResponse,
  FullContextResponse,
} from '../shared/types/context.types.js';
import type {
  ConversationRef,
  ListConversationsOptions,
  SessionConfig as SessionConfigPreload,
} from '../shared/types/conversation.types.js';
import type {
  LoadProvidersResult,
  SaveProviderRequest,
  SaveProviderResult,
  ValidateTokenRequest,
  ValidateTokenResponse,
} from '../shared/types/model.providers.types.js';
import type {
  OAuthConnectResult,
  OAuthDisconnectResult,
  OAuthListResult,
  OAuthProviderId,
} from '../shared/types/oauth.types.js';
import type { Settings } from '../shared/types/settings.types.js';
import type {
  ToolListResult,
  ToolSettingsUpdate,
} from '../shared/types/tools.types.js';
import type { Workspace, WorkspaceUpdate } from '../shared/types/workspace.types.js';

// Widget types (keeping local for now as they have React dependencies)
interface WidgetPlacement {
  id: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
}

interface Layout {
  name: string;
  grid: { columns: number; rowHeight: number };
  widgets: WidgetPlacement[];
}

interface LoadLayoutResult {
  layout: Layout;
}

interface WidgetToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// Context types (re-exported for compatibility)
type ContextResponse = FullContextResponse | FilesOnlyResponse;

// Chat API interface
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

// Conversation API interface
interface ConversationAPI {
  list: (options?: ListConversationsOptions) => Promise<ConversationRef[]>;
  restore: (id: string) => Promise<{
    id: string;
    messages: ChatMessage[];
    config: SessionConfigPreload;
    createdAt: string;
    updatedAt: string;
  } | null>;
  onChange: (callback: () => void) => () => void;
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
  widgets: {
    loadLayout: (layoutId: string) => Promise<LoadLayoutResult | null>;
    callTool: (toolName: string, params?: unknown) => Promise<unknown>;
    listTools: () => Promise<WidgetToolDefinition[]>;
  };
  conversations: ConversationAPI;
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
      load: (autoRefresh?: boolean) => ipcRenderer.invoke('models.providers:load', autoRefresh),
      save: (request: SaveProviderRequest) => ipcRenderer.invoke('models.providers:save', request),
    },
    validate: (request: ValidateTokenRequest) => ipcRenderer.invoke('models:validate', request),
    onChange: (callback: (models: ChatModelInfo[]) => void) => {
      const handler = (_event: unknown, models: ChatModelInfo[]): void => {
        callback(models);
      };
      ipcRenderer.on('models:changed', handler);
      return () => {
        ipcRenderer.removeListener('models:changed', handler);
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
      ipcRenderer.on('workspace:changed', handler);
      return () => {
        ipcRenderer.removeListener('workspace:changed', handler);
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
    getModels: () => ipcRenderer.invoke('chat.models:get'),
    getTools: () => ipcRenderer.invoke('chat.tools:get'),
    getAgents: () => ipcRenderer.invoke('chat.agents:get'),
    clear: () => {
      void ipcRenderer.invoke('chat:clear');
    },
    context: {
      get: (threadId?: string) => ipcRenderer.invoke('chat.context:get', threadId),
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
      ipcRenderer.on('tools:changed', handler);
      return () => {
        ipcRenderer.removeListener('tools:changed', handler);
      };
    },
  },
  widgets: {
    loadLayout: (layoutId: string) => ipcRenderer.invoke('widgets:loadLayout', layoutId),
    callTool: (toolName: string, params?: unknown) =>
      ipcRenderer.invoke('widgets:callTool', toolName, params),
    listTools: () => ipcRenderer.invoke('widgets:listTools'),
  },
  conversations: {
    list: (options?: ListConversationsOptions) => ipcRenderer.invoke('conversations:list', options),
    restore: (id: string) => ipcRenderer.invoke('conversations:restore', id),
    onChange: (callback: () => void) => {
      const handler = (): void => {
        callback();
      };
      ipcRenderer.on('conversations:changed', handler);
      return () => {
        ipcRenderer.removeListener('conversations:changed', handler);
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
