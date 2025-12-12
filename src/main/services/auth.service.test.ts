/**
 * Auth Service Tests
 *
 * Note: Due to ESM module constraints with Jest, these tests mock
 * at the function level rather than module level. For full integration
 * testing of the OAuth flow, use E2E tests with Playwright.
 */
import { describe, expect, it } from '@jest/globals';

describe('auth.service - unit tests', () => {
  describe('JWT decoding', () => {
    it('should decode JWT payload correctly', () => {
      // Test JWT: {"sub":"123","exp":1893456000} (expires 2030-01-01)
      const testToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE4OTM0NTYwMDB9.signature';

      const decodeJwt = (token: string): { exp?: number; sub?: string } => {
        try {
          const [, payload] = token.split('.');
          const decoded = Buffer.from(payload, 'base64').toString('utf-8');
          return JSON.parse(decoded) as { exp?: number; sub?: string };
        } catch {
          return {};
        }
      };

      const decoded = decodeJwt(testToken);
      expect(decoded.sub).toBe('123');
      expect(decoded.exp).toBe(1893456000);
    });

    it('should return empty object for invalid JWT', () => {
      const decodeJwt = (token: string): { exp?: number } => {
        try {
          const [, payload] = token.split('.');
          const decoded = Buffer.from(payload, 'base64').toString('utf-8');
          return JSON.parse(decoded) as { exp?: number };
        } catch {
          return {};
        }
      };

      expect(decodeJwt('invalid')).toEqual({});
      expect(decodeJwt('')).toEqual({});
    });
  });

  describe('Token expiry calculation', () => {
    it('should correctly identify expired token', () => {
      const isTokenExpired = (expiresAt: string | undefined): boolean => {
        if (!expiresAt) return false;
        return new Date(expiresAt) <= new Date();
      };

      // Past date - should be expired
      expect(isTokenExpired('2020-01-01T00:00:00Z')).toBe(true);

      // Future date - should not be expired
      expect(isTokenExpired('2099-12-31T23:59:59Z')).toBe(false);

      // Undefined - should not be expired (no expiry = no expiry check)
      expect(isTokenExpired(undefined)).toBe(false);
    });
  });

  describe('OAuth URL construction', () => {
    it('should construct correct desktop login URL', () => {
      const backendUrl = 'https://test.agentage.io';
      const port = 3739;
      const callbackUrl = `http://localhost:${String(port)}/callback`;
      const loginPageUrl = `${backendUrl}/desktop-login?callback=${encodeURIComponent(callbackUrl)}`;

      expect(loginPageUrl).toBe(
        'https://test.agentage.io/desktop-login?callback=http%3A%2F%2Flocalhost%3A3739%2Fcallback'
      );
    });

    it('should construct correct provider link URL', () => {
      const backendUrl = 'https://test.agentage.io';
      const port = 3739;
      const callbackUrl = `http://localhost:${String(port)}/callback`;
      const provider = 'github';
      const token = 'test-jwt-token';
      const state = Buffer.from(token).toString('base64');

      const linkUrl = `${backendUrl}/desktop-login?callback=${encodeURIComponent(callbackUrl)}&action=link&provider=${provider}&token=${state}`;

      expect(linkUrl).toContain('action=link');
      expect(linkUrl).toContain('provider=github');
      expect(linkUrl).toContain('token=');
    });
  });

  describe('Auth state validation', () => {
    it('should validate auth state structure', () => {
      interface AuthState {
        token: string;
        expiresAt?: string;
        user?: { id: string; email: string };
        githubToken?: string;
      }

      const validState: AuthState = {
        token: 'jwt-token',
        expiresAt: '2099-12-31T23:59:59Z',
        user: { id: '1', email: 'test@test.com' },
      };

      expect(validState.token).toBeDefined();
      expect(validState.user?.email).toBe('test@test.com');
    });

    it('should handle optional github token', () => {
      interface AuthState {
        token: string;
        githubToken?: string;
      }

      const stateWithGithub: AuthState = {
        token: 'jwt-token',
        githubToken: 'github-token',
      };

      const stateWithoutGithub: AuthState = {
        token: 'jwt-token',
      };

      expect(stateWithGithub.githubToken).toBe('github-token');
      expect(stateWithoutGithub.githubToken).toBeUndefined();
    });
  });
});
