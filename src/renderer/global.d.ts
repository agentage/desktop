// Global type declarations for the renderer process

// Re-export the AgentageAPI interface from preload
// This enables TypeScript to understand window.agentage in renderer code

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

interface AgentageAPI {
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
    quit: () => void;
  };
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
  };
}

declare global {
  interface Window {
    agentage: AgentageAPI;
  }
}

export {};
