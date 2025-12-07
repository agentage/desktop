import { contextBridge, ipcRenderer } from 'electron';

export interface AgentageAPI {
  agents: {
    list: () => Promise<string[]>;
    run: (name: string, prompt: string) => Promise<string>;
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
