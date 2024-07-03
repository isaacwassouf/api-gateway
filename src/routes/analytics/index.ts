import express from 'express';
import { Request, Response } from 'express';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { AnalyticsClient } from '../../services/analytics';
import { LogsList } from '../../types/analytics';
import { ListLogsRequest } from '../../protobufs/analytics-service-protobufs/analytics-service_pb';

// Create a new router
export const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const windowQuery = req.query.window;
  const window = windowQuery ? parseInt(windowQuery.toString()) : 0;

  AnalyticsClient.getInstance().listLogs(
    new ListLogsRequest().setWindow(window),
    (error, response) => {
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
    },
  );
});
