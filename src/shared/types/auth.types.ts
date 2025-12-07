export type OAuthProvider = 'google' | 'github' | 'microsoft';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  verifiedAlias?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface AuthState {
  token: string;
  expiresAt?: string; // ISO datetime string (CLI compatible)
  user?: User;
}
