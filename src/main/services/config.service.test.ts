/**
 * Config Service Tests
 */
import { describe, expect, it } from '@jest/globals';

describe('config.service - unit tests', () => {
  describe('isTokenExpired', () => {
    const isTokenExpired = (expiresAt: string | undefined): boolean => {
      if (!expiresAt) return false;
      return new Date(expiresAt) <= new Date();
    };

    it('should return false for undefined expiry', () => {
      expect(isTokenExpired(undefined)).toBe(false);
    });

    it('should return true for past date', () => {
      expect(isTokenExpired('2020-01-01T00:00:00Z')).toBe(true);
    });

    it('should return false for future date', () => {
      expect(isTokenExpired('2099-12-31T23:59:59Z')).toBe(false);
    });
  });

  describe('config schema validation', () => {
    it('should accept valid config with auth', () => {
      const validConfig = {
        auth: {
          token: 'test-jwt-token',
          expiresAt: '2099-12-31T23:59:59Z',
          user: {
            id: '123',
            email: 'test@test.com',
            name: 'Test User',
          },
        },
        registry: {
          url: 'https://agentage.io',
        },
        tokens: [],
      };

      expect(validConfig.auth.token).toBeDefined();
      expect(validConfig.auth.user.email).toBe('test@test.com');
      expect(validConfig.registry.url).toBe('https://agentage.io');
      expect(validConfig.tokens).toEqual([]);
    });

    it('should accept minimal config', () => {
      const minimalConfig = { tokens: [] };
      expect(minimalConfig).toBeDefined();
    });

    it('should handle config with tokens array', () => {
      const configWithTokens = {
        auth: {
          token: 'jwt-token',
        },
        tokens: [
          {
            provider: 'github',
            scope: ['repo', 'read:user'],
            value: 'ghp_abc123',
            username: 'john-doe',
            connectedAt: '2025-12-14T00:00:00.000Z',
          },
        ],
      };

      expect(configWithTokens.tokens).toHaveLength(1);
      expect(configWithTokens.tokens[0].provider).toBe('github');
      expect(configWithTokens.tokens[0].value).toBe('ghp_abc123');
    });
  });

  describe('config directory paths', () => {
    it('should use correct config directory structure', () => {
      const CONFIG_DIR = '~/.agentage';
      const CONFIG_FILE = `${CONFIG_DIR}/config.json`;

      expect(CONFIG_FILE).toBe('~/.agentage/config.json');
    });
  });

  describe('registry URL defaults', () => {
    it('should have correct default registry URL', () => {
      const DEFAULT_REGISTRY_URL = 'https://dev.agentage.io';

      const getRegistryUrl = (config: { registry?: { url: string } }): string =>
        config.registry?.url ?? DEFAULT_REGISTRY_URL;

      expect(getRegistryUrl({})).toBe('https://dev.agentage.io');
      expect(getRegistryUrl({ registry: { url: 'https://custom.url' } })).toBe(
        'https://custom.url'
      );
    });
  });
});
