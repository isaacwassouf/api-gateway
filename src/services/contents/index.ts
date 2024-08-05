import {
  IContentServiceClient,
  ContentServiceClient,
} from '../../protobufs/content-service-protobufs/content-service_grpc_pb';
import { credentials } from '@grpc/grpc-js';

export class ContentManagementClient {
  private static instance: IContentServiceClient;

  private constructor() {
    const contentServiceHost = process.env.CONTENT_SERVICE_HOST || 'localhost';
    const contentServicePort = process.env.CONTENT_SERVICE_PORT || '8085';

    // Create a new client
    ContentManagementClient.instance = new ContentServiceClient(
      `${contentServiceHost}:${contentServicePort}`,
      credentials.createInsecure(),
    );
  }

  public static getInstance(): IContentServiceClient {
    if (!ContentManagementClient.instance) {
      new ContentManagementClient();
    }
    return ContentManagementClient.instance;
  }
}
