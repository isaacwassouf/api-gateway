import {
  AuthProviderName,
  GetAuthProviderCredentialsRequest,
} from '../protobufs/users-management-service/users-management_pb';
import { UserManagementClient } from '../services/users';
import { AuthProviderCredentials } from '../types/auth';

export const getGitHubCredentials =
  async (): Promise<AuthProviderCredentials> => {
    // prepare the gRPC request
    const request = new GetAuthProviderCredentialsRequest();
    // set the auth provider
    request.setAuthProvider(AuthProviderName.GITHUB);

    return new Promise((resolve, reject) => {
      UserManagementClient.getInstance().getAuthProviderCredentials(
        request,
        (err, response) => {
          if (err) {
            reject(err);
          }

          const credentials: AuthProviderCredentials = {
            clientId: response.getClientId(),
            clientSecret: response.getClientSecret(),
          };

          resolve(credentials);
        },
      );
    });
  };

export const getGoogleCredentials =
  async (): Promise<AuthProviderCredentials> => {
    // prepare the gRPC request
    const request = new GetAuthProviderCredentialsRequest();
    // set the auth provider
    request.setAuthProvider(AuthProviderName.GOOGLE);

    return new Promise((resolve, reject) => {
      UserManagementClient.getInstance().getAuthProviderCredentials(
        request,
        (err, response) => {
          if (err) {
            reject(err);
          }

          const credentials: AuthProviderCredentials = {
            clientId: response.getClientId(),
            clientSecret: response.getClientSecret(),
          };

          resolve(credentials);
        },
      );
    });
  };
