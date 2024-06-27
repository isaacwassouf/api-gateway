import {
  ISchemaServiceClient,
  SchemaServiceClient,
} from '../../protobufs/schema-service-protobutfs/schema-service_grpc_pb';
import { credentials } from '@grpc/grpc-js';

export class SchemaManagementClient {
  private static instance: ISchemaServiceClient;

  private constructor() {
    // Create a new client
    SchemaManagementClient.instance = new SchemaServiceClient(
      'localhost:8084',
      credentials.createInsecure(),
    );
  }

  public static getInstance(): ISchemaServiceClient {
    if (!SchemaManagementClient.instance) {
      new SchemaManagementClient();
    }
    return SchemaManagementClient.instance;
  }
}
