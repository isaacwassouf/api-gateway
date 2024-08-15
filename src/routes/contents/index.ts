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

router.post(
  '/tables/:tableName',
  ensureAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    const tableName = req.params.tableName;
    const page = req.body.page ?? 1;
    const perPage = req.body.perPage ?? 10;
    const filters: Map<string, any> = req.body?.filters ?? new Map();

    const grpcRequest = new ListContentRequest();
    grpcRequest.setTableName(tableName);
    grpcRequest.setPage(page);
    grpcRequest.setPerPage(perPage);

    if (res.locals?.user?.is_admin) {
      grpcRequest.setCreatorId(0);
    } else {
      grpcRequest.setCreatorId(res.locals?.user?.id ?? 0);
    }

    // iterate over the body and set the content
    for (const [key, value] of Object.entries(filters)) {
      //convert the value to base64 toString
      const encodedValue = btoa(value.toString());
      grpcRequest.getFiltersMap().set(key, encodedValue);
    }

    ContentManagementClient.getInstance().listContent(
      grpcRequest,
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
            data: entitiesList,
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
          // decode the base64 response
          const decoded = atob(response.getContent_asB64().toString());

          // parse the JSON
          const jsonData = JSON.parse(decoded);

          res.json({ data: jsonData });

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
          res.locals.defaultMessage = 'Content created successfully';
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
          res.locals.defaultMessage = 'Entity updated successfully';
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
          res.locals.defaultMessage = 'Entity deleted successfully';
        }
        next();
      },
    );
  },
  logger,
);
