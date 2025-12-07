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

export interface AgentageAPI {
  agents: {
    list: () => Promise<string[]>;
    run: (name: string, prompt: string) => Promise<string>;
  };
  auth: {
    login: (provider: OAuthProvider) => Promise<AuthResult>;
    logout: () => Promise<{ success: boolean }>;
    getUser: () => Promise<User | null>;
  };
  config: {
    get: () => Promise<Record<string, unknown>>;
    set: (key: string, value: unknown) => Promise<void>;
  };
  app: {
    getVersion: () => Promise<string>;
    quit: () => void;
  };
}

const api: AgentageAPI = {
  agents: {
    list: () => ipcRenderer.invoke('agents:list'),
    run: (name: string, prompt: string) => ipcRenderer.invoke('agents:run', name, prompt),
  },
  auth: {
    login: (provider: OAuthProvider) => ipcRenderer.invoke('auth:login', provider),
    logout: () => ipcRenderer.invoke('auth:logout'),
    getUser: () => ipcRenderer.invoke('auth:getUser'),
  },
  config: {
    get: () => ipcRenderer.invoke('config:get'),
    set: (key: string, value: unknown) => ipcRenderer.invoke('config:set', key, value),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:version'),
    quit: () => {
      ipcRenderer.send('app:quit');
    },
  },
};

contextBridge.exposeInMainWorld('agentage', api);

declare global {
  interface Window {
    agentage: AgentageAPI;
  }
}
