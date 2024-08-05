import {
  IAnalyticsServiceClient,
  AnalyticsServiceClient,
} from '../../protobufs/analytics-service-protobufs/analytics-service_grpc_pb';
import { credentials } from '@grpc/grpc-js';

export class AnalyticsClient {
  private static instance: IAnalyticsServiceClient;

  private constructor() {
    const anayticsServiceHost =
      process.env.ANALYTICS_SERVICE_HOST || 'localhost';
    const analyticsServicePort = process.env.ANALYTICS_SERVICE_PORT || '8089';

    // Create a new client
    AnalyticsClient.instance = new AnalyticsServiceClient(
      `${anayticsServiceHost}:${analyticsServicePort}`,
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
