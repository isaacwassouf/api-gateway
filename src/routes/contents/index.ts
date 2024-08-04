import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import { ListContentRequest } from '../../protobufs/content-service-protobufs/content-service_pb';
import { ContentManagementClient } from '../../services/contents';
import { logger } from '../../middlewares';
import { ensureAuthenticated } from '../../middlewares/auth';

// Create a new router
export const router = express.Router();

router.get(
  '/tables/:tableName',
  ensureAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const tableName = req.params.tableName;

    ContentManagementClient.getInstance().listContent(
      new ListContentRequest()
        .setTableName(tableName)
        .setPage(1)
        .setPerPage(10),
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
          const entitiesList = response
            .getEntitiesList_asB64()
            .map((entity) => {
              return JSON.parse(Buffer.from(entity, 'base64').toString());
            });

          res.json({
            entities: entitiesList,
            page: response.getPage(),
            perPage: response.getPerPage(),
            totalPages: response.getTotalPages(),
          });

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Table data listed successfully';
        }
        next();
      },
    );
  },
  logger,
);
