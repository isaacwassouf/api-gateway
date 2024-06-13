import {
  IUserManagerClient,
  UserManagerClient,
} from '../../protobufs/users-management-service/users-management_grpc_pb';
import { credentials } from '@grpc/grpc-js';

export class UserManagementClient {
  private static instance: IUserManagerClient;

  private constructor() {
    // Create a new client
    UserManagementClient.instance = new UserManagerClient(
      'localhost:50051',
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
