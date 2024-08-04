import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import {
  CreateContentRequest,
  DeleteContentRequest,
  GetContentRequest,
  ListContentRequest,
  UpdateContentRequest,
} from '../../protobufs/content-service-protobufs/content-service_pb';
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
    const creatorId = res.locals?.user?.id ?? 0;

    ContentManagementClient.getInstance().listContent(
      new ListContentRequest()
        .setTableName(tableName)
        .setCreatorId(creatorId)
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

router.get(
  '/tables/:tableName/:entityId',
  ensureAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const tableName = req.params.tableName;
    const entityId = req.params.entityId;

    const creatorId = res.locals?.user?.id ?? 0;

    ContentManagementClient.getInstance().getContent(
      new GetContentRequest()
        .setTableName(tableName)
        .setEntityId(entityId)
        .setCreatorId(creatorId),
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
          const entity = JSON.parse(
            Buffer.from(response.getContent_asB64()).toString(),
          );

          res.json({ entity });

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

router.post(
  '/tables/:tableName',
  ensureAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const tableName = req.params.tableName;

    const creatorId = res.locals?.user?.id ?? 0;
    const grpcRequest = new CreateContentRequest();
    grpcRequest.setTableName(tableName);
    grpcRequest.setCreatorId(creatorId);

    // iterate over the body and set the content
    for (const [key, value] of Object.entries(req.body)) {
      grpcRequest.getDataMap().set(key, value as string);
    }

    ContentManagementClient.getInstance().createContent(
      grpcRequest,
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json({ entityId: response.getId() });

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

router.put(
  '/tables/:tableName/:entityId',
  ensureAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const tableName = req.params.tableName;
    const entityId = req.params.entityId;

    const creatorId = res.locals?.user?.id ?? 0;
    const grpcRequest = new UpdateContentRequest();
    grpcRequest.setTableName(tableName);
    grpcRequest.setCreatorId(creatorId);
    grpcRequest.setEntityId(entityId);

    // iterate over the body and set the content
    for (const [key, value] of Object.entries(req.body)) {
      grpcRequest.getDataMap().set(key, value as string);
    }

    ContentManagementClient.getInstance().updateContent(
      grpcRequest,
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json({ message: 'Entity updated successfully' });

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

router.delete(
  '/tables/:tableName/:entityId',
  ensureAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const tableName = req.params.tableName;
    const entityId = req.params.entityId;
    const creatorId = res.locals?.user?.id ?? 0;

    const grpcRequest = new DeleteContentRequest();
    grpcRequest.setTableName(tableName);
    grpcRequest.setCreatorId(creatorId);
    grpcRequest.setEntityId(entityId);

    ContentManagementClient.getInstance().deleteContent(
      grpcRequest,
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json({ message: 'Entity deleted successfully' });

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
