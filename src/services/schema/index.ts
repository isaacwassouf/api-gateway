import {
  ISchemaServiceClient,
  SchemaServiceClient,
} from '../../protobufs/schema-service-protobutfs/schema-service_grpc_pb';
import { credentials } from '@grpc/grpc-js';

export class SchemaManagementClient {
  private static instance: ISchemaServiceClient;

  private constructor() {
    const schemaServiceHost = process.env.SCHEMA_SERVICE_HOST || 'localhost';
    const schemaServicePort = process.env.SCHEMA_SERVICE_PORT || '8084';

    // Create a new client
    SchemaManagementClient.instance = new SchemaServiceClient(
      `${schemaServiceHost}:${schemaServicePort}`,
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
