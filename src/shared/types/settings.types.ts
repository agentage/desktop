import type { ModelProvider, SyncedSettings } from './config.types.js';

/**
 * Settings state (combines local and synced)
 */
export interface Settings {
  // Local settings (from config)
  models: ModelProvider[];
  backendUrl: string;

  // Synced settings
  theme: 'light' | 'dark' | 'system';
  defaultModelProvider?: string;
  logRetention: 7 | 30 | 90 | -1;
  language: string;
}

/**
 * Re-export for convenience
 */
export type { ModelProvider, SyncedSettings };
