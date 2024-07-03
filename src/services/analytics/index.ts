import {
  IAnalyticsServiceClient,
  AnalyticsServiceClient,
} from '../../protobufs/analytics-service-protobufs/analytics-service_grpc_pb';
import { credentials } from '@grpc/grpc-js';

export class AnalyticsClient {
  private static instance: IAnalyticsServiceClient;

  private constructor() {
    // Create a new client
    AnalyticsClient.instance = new AnalyticsServiceClient(
      'localhost:8089',
      credentials.createInsecure(),
    );
  }

  public static getInstance(): IAnalyticsServiceClient {
    if (!AnalyticsClient.instance) {
      new AnalyticsClient();
    }
    return AnalyticsClient.instance;
  }
}
