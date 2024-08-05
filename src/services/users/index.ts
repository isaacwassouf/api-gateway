import {
  IUserManagerClient,
  UserManagerClient,
} from '../../protobufs/users-management-service/users-management_grpc_pb';
import { credentials } from '@grpc/grpc-js';

export class UserManagementClient {
  private static instance: IUserManagerClient;

  private constructor() {
    const userManagementServiceHost =
      process.env.USERS_SERVICE_HOST || 'localhost';
    const userManagementServicePort = process.env.USERS_SERVICE_PORT || '50051';
    // Create a new client
    UserManagementClient.instance = new UserManagerClient(
      `${userManagementServiceHost}:${userManagementServicePort}`,
      credentials.createInsecure(),
    );
  }

  public static getInstance(): IUserManagerClient {
    if (!UserManagementClient.instance) {
      new UserManagementClient();
    }
    return UserManagementClient.instance;
  }
}
