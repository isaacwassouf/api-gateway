import {
  IEmailManagerClient,
  EmailManagerClient,
} from '../../protobufs/email-service-protobufs/email-management_grpc_pb';
import { credentials } from '@grpc/grpc-js';

export class EmailManagementClient {
  private static instance: IEmailManagerClient;

  private constructor() {
    const emailServiceHost = process.env.EMAIL_SERVICE_HOST || 'localhost';
    const emailServicePort = process.env.EMAIL_SERVICE_PORT || '8080';
    // Create a new client
    EmailManagementClient.instance = new EmailManagerClient(
      `${emailServiceHost}:${emailServicePort}`,
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
