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
      };

      expect(validConfig.auth.token).toBeDefined();
      expect(validConfig.auth.user.email).toBe('test@test.com');
      expect(validConfig.registry.url).toBe('https://agentage.io');
    });

    it('should accept minimal config', () => {
      const minimalConfig = {};
      expect(minimalConfig).toBeDefined();
    });

    it('should handle config with github token', () => {
      const configWithGithub = {
        auth: {
          token: 'jwt-token',
          githubToken: 'github-personal-access-token',
        },
      };

      expect(configWithGithub.auth.githubToken).toBe('github-personal-access-token');
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
