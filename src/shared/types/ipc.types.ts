export interface IpcChannels {
  // Agent channels
  'agents:list': () => Promise<string[]>;
  'agents:run': (name: string, prompt: string) => Promise<string>;

  // Config channels
  'config:get': () => Promise<Record<string, unknown>>;
  'config:set': (key: string, value: unknown) => Promise<void>;

  // App channels
  'app:version': () => Promise<string>;
  'app:quit': () => void;
}

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
