import {
  IEmailManagerClient,
  EmailManagerClient,
} from '../../protobufs/email-service-protobufs/email-management_grpc_pb';
import { credentials } from '@grpc/grpc-js';

export class EmailManagementClient {
  private static instance: IEmailManagerClient;

  private constructor() {
    // Create a new client
    EmailManagementClient.instance = new EmailManagerClient(
      'localhost:8080',
      credentials.createInsecure(),
    );
  }

  public static getInstance(): IEmailManagerClient {
    if (!EmailManagementClient.instance) {
      new EmailManagementClient();
    }
    return EmailManagementClient.instance;
  }
}
