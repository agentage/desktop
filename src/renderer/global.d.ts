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
  models: {
    providers: {
      load: (autoRefresh?: boolean) => Promise<LoadProvidersResult>;
      save: (request: SaveProviderRequest) => Promise<SaveProviderResult>;
    };
    validate: (request: ValidateTokenRequest) => Promise<ValidateTokenResponse>;
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
    quit: () => void;
  };
  settings: {
    get: () => Promise<Settings>;
    update: (updates: Partial<Settings>) => Promise<void>;
    getModelProvider: (id: string) => Promise<ModelProvider | undefined>;
    setModelProvider: (provider: ModelProvider) => Promise<void>;
    removeModelProvider: (id: string) => Promise<void>;
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
