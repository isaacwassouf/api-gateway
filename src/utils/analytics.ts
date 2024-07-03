import { Request } from 'express';
import {
  LogEntry,
  LogRequest,
} from '../protobufs/analytics-service-protobufs/analytics-service_pb';
import { AnalyticsClient } from '../services/analytics';

export const log = async (logRequest: LogRequest) => {
  return new Promise((resolve, reject) => {
    AnalyticsClient.getInstance().log(logRequest, (error, response) => {
      if (error) {
        return reject(error);
      }
      return resolve(response.toObject());
    });
  });
};

export const getServicNameFromRequest = (request: Request): string => {
  console.log(request.originalUrl);
  if (request.originalUrl.startsWith('/api/schema')) {
    return 'schema-service';
  }

  if (request.originalUrl.startsWith('/api/contents')) {
    return 'contents-service';
  }

  if (request.originalUrl.startsWith('/api/auth')) {
    return 'auth-service';
  }

  return 'unknown-service';
};

export const createLogEntry = (request: Request): LogEntry => {
  const logEntry: LogEntry = new LogEntry();
  // set the service name
  logEntry.setServiceName(getServicNameFromRequest(request));
  // set the request metadata
  const metadata = {
    requestType: request.method,
    endpoint: request.originalUrl,
    responseMessage: 'Listed tables',
    ip:
      request.headers?.['x-forwarded-for'] ||
      request?.socket?.remoteAddress ||
      '',
    userAgent: request.get('User-Agent'),
  };
  logEntry.setMetadata(JSON.stringify(metadata));

  return logEntry;
};
