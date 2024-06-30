import {
  IContentServiceClient,
  ContentServiceClient,
} from '../../protobufs/content-service-protobufs/content-service_grpc_pb';
import { credentials } from '@grpc/grpc-js';

export class ContentManagementClient {
  private static instance: IContentServiceClient;

  private constructor() {
    // Create a new client
    ContentManagementClient.instance = new ContentServiceClient(
      'localhost:8085',
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
