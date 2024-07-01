export interface AuthProvider {
  id: number;
  name: string;
  active: boolean;
  clientId: string;
}

export interface AuthProvidersList {
  authProviders: AuthProvider[];
}
