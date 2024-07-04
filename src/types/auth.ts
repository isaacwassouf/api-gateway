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
