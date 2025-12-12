export type OAuthProvider = 'google' | 'github' | 'microsoft';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  verifiedAlias?: string; // GitHub username if verified
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface AuthState {
  token: string; // Agentage JWT
  expiresAt?: string; // ISO datetime string
  user?: User;
  githubToken?: string; // GitHub access token (device-only, returned once)
}

/**
 * GitHub token is:
 * - Returned ONLY on initial GitHub OAuth login
 * - NEVER stored on backend (security)
 * - Stored ONLY in ~/.agentage/config.json on device
 * - Used for: git clone, push, GitHub API calls
 */

export interface LinkedProvider {
  name: OAuthProvider;
  email: string;
  connectedAt: string; // ISO datetime
}

export interface UserWithProviders extends User {
  providers: OAuthProvider[];
}

export interface LinkProviderResult {
  success: boolean;
  provider?: LinkedProvider;
  providerToken?: string; // GitHub token (returned once, device-only)
  error?: string;
}

export interface UnlinkProviderResult {
  success: boolean;
  error?: string;
}

/**
 * OAuth callback response from backend
 * GitHub token included only when:
 * - Provider is 'github'
 * - Request includes desktop=true
 * - This is initial OAuth (not refresh)
 */
export interface OAuthCallbackResponse {
  token: string; // Agentage JWT (always)
  github_token?: string; // GitHub access token (once, if GitHub provider)
}
