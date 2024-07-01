import express from 'express';
import { Request, Response } from 'express';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { ListContentRequest } from '../../protobufs/content-service-protobufs/content-service_pb';
import { ContentManagementClient } from '../../services/contents';

// Create a new router
export const router = express.Router();

router.get('/tables/:tableName', async (req: Request, res: Response) => {
  const tableName = req.params.tableName;

  ContentManagementClient.getInstance().listContent(
    new ListContentRequest().setTableName(tableName).setPage(1).setPerPage(10),
    (error, response) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      const entitiesList = response.getEntitiesList_asB64().map((entity) => {
        return JSON.parse(Buffer.from(entity, 'base64').toString());
      });

      return res.json({
        entities: entitiesList,
        page: response.getPage(),
        perPage: response.getPerPage(),
        totalPages: response.getTotalPages(),
      });
    },
  );
});
