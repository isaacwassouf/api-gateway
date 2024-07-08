export interface AuthProvider {
  id: number;
  name: string;
  active: boolean;
  clientId: string;
}

export interface AuthProvidersList {
  authProviders: AuthProvider[];
}

export interface RegisterAdminData {
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface LoginAdminData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  isVerified: boolean;
  authProvider: string;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubUserResponse {
  [key: string]: any;
  id: number;
  name: string;
}

export interface GitHubEmailResponse {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string;
}

export interface AuthProviderCredentials {
  clientId: string;
  clientSecret: string;
}
