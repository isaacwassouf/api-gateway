import {
  AuthProviderName,
  GetAuthProviderCredentialsRequest,
  VerifyTokenRevoationRequest,
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
            redirectURI: response.getRedirectUri(),
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
            redirectURI: response.getRedirectUri(),
          };

          resolve(credentials);
        },
      );
    });
  };

export const verifyTokenRevocation = async (
  userID: number,
  jti: string,
): Promise<{ isRevoked: boolean }> => {
  const grpcRequest = new VerifyTokenRevoationRequest();
  grpcRequest.setUserId(userID);
  grpcRequest.setJti(jti);

  return new Promise((resolve, reject) => {
    UserManagementClient.getInstance().verifyTokenRevoation(
      grpcRequest,
      (err, response) => {
        if (err) {
          reject(err);
        }

        resolve({ isRevoked: response.getIsRevoked() });
      },
    );
  });
};
