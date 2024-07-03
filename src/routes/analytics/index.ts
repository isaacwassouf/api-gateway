import express from 'express';
import { Request, Response } from 'express';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { AnalyticsClient } from '../../services/analytics';
import { LogsList } from '../../types/analytics';

// Create a new router
export const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  console.log('GET /logs');
  AnalyticsClient.getInstance().listLogs(new Empty(), (error, response) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const logsList: LogsList = {
      logs: [],
    };

    response.getLogsList().forEach((log) => {
      logsList.logs.push({
        service: log.getServiceName(),
        level: log.getLevel(),
        message: log.getResponseMessage(),
        createdAt: log.getCreatedAt(),
        metaData: log.getMetadata(),
      });
    });

    return res.status(200).json(logsList);
  });
});
