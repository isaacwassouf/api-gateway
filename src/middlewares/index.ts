import { Request, Response, NextFunction } from 'express';
import { LogRequest } from '../protobufs/analytics-service-protobufs/analytics-service_pb';
import { createLogEntry, log } from '../utils/analytics';

export const logger = async (req: Request, res: Response) => {
  const logEntry = createLogEntry(req);

  if (res.locals.callError) {
    logEntry.setLevel('ERROR');
    logEntry.setResponseMessage(res.locals.callError.message);
  } else {
    logEntry.setLevel('INFO');

    if (res.locals.callResponse?.getMessage === undefined) {
      logEntry.setResponseMessage(res.locals.defaultMessage ?? '');
    } else {
      logEntry.setResponseMessage(res.locals.callResponse.getMessage());
    }
  }

  try {
    await log(new LogRequest().setLogEntry(logEntry));
  } catch (error) {
    console.error(error);
  }
};
