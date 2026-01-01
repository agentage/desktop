import type {
  OAuthConnectResult,
  OAuthDisconnectResult,
  OAuthListResult,
  OAuthProviderId,
  OAuthProviderStatus,
} from '../../../shared/types/oauth.types.js';
import type { OAuthProvider } from './base-provider.js';
import { OAuthStorage } from './oauth-storage.service.js';
import { ClaudeProvider } from './providers/claude.provider.js';
import { CodexProvider } from './providers/codex.provider.js';

/**
 * OAuth manager - orchestrates OAuth operations
 */
export class OAuthManager {
  private storage = new OAuthStorage();
  private providers = new Map<OAuthProviderId, OAuthProvider>();

  constructor() {
    // Register available providers
    this.register(new ClaudeProvider());
    this.register(new CodexProvider());
  }

  /**
   * Register a provider
   */
  private register(provider: OAuthProvider): void {
    this.providers.set(provider.config.id as OAuthProviderId, provider);
  }

  /**
   * List all providers with their status
   */
  async list(): Promise<OAuthListResult> {
    const data = await this.storage.load();
    const statuses: OAuthProviderStatus[] = [];

    for (const [id, provider] of this.providers) {
      const stored = data.providers[id];
      const isExpired = stored ? provider.isExpired(stored.tokens) : false;

      statuses.push({
        id,
        name: provider.config.name,
        icon: provider.config.icon,
        description: provider.config.description,
        connected: !!stored,
        profile: stored?.profile,
        expiresAt: stored?.tokens.expiresAt ?? undefined,
        isExpired,
      });
    }

    return { providers: statuses };
  }

  /**
   * Connect to a provider via OAuth
   */
  async connect(providerId: OAuthProviderId): Promise<OAuthConnectResult> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      return { success: false, error: `Unknown provider: ${providerId}` };
    }

    try {
      const { tokens, profile } = await provider.authorize();
      await this.storage.saveProvider(providerId, {
        tokens,
        profile,
        connectedAt: Date.now(),
      });
      return { success: true, profile };
    } catch (error) {
      console.error(`[OAuthManager] Connect error for ${providerId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authorization failed',
      };
    }
  }

  /**
   * Disconnect a provider
   */
  async disconnect(providerId: OAuthProviderId): Promise<OAuthDisconnectResult> {
    try {
      await this.storage.removeProvider(providerId);
      return { success: true };
    } catch (error) {
      console.error(`[OAuthManager] Disconnect error for ${providerId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Disconnect failed',
      };
    }
  }

  /**
   * Get valid access token for provider (with auto-refresh)
   * Used internally by other services, not exposed to UI
   */
  async getAccessToken(providerId: OAuthProviderId): Promise<string | null> {
    const provider = this.providers.get(providerId);
    if (!provider) return null;

    const data = await this.storage.load();
    const stored = data.providers[providerId];
    if (!stored) return null;

    // Check if token needs refresh
    if (provider.isExpired(stored.tokens) && stored.tokens.refreshToken) {
      try {
        const newTokens = await provider.refreshToken(stored.tokens.refreshToken);
        await this.storage.saveProvider(providerId, {
          ...stored,
          tokens: newTokens,
        });
        return newTokens.accessToken;
      } catch (error) {
        console.error(`[OAuthManager] Token refresh failed for ${providerId}:`, error);
        return null;
      }
    }

    return stored.tokens.accessToken;
  }
}

// Singleton instance
let instance: OAuthManager | null = null;

/**
 * Get OAuth manager singleton
 */
export const getOAuthManager = (): OAuthManager => {
  instance ??= new OAuthManager();
  return instance;
};
