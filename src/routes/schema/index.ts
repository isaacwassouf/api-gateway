import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import { SchemaManagementClient } from '../../services/schema';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import {
  DropTableRequest,
  ListColumnsRequest,
  DropColumnRequest,
  AddForeignKeyRequest,
  ForeignKey,
  DropForeignKeyRequest,
} from '../../protobufs/schema-service-protobutfs/schema-service_pb';
import { AddForeignKeyDetails, ColumnsList } from '../../types/schema';
import {
  getColumnType,
  getReferenialActionFromEnum,
  getReferenialActionFromString,
} from '../../utils/schema';

// Create a new router
export const router = express.Router();

router.post('/tables', (req: Request, res: Response) => {
  const table = req.body;
  console.log(table);

  return res.sendStatus(200);
});

router.get('/tables', (_: Request, res: Response) => {
  SchemaManagementClient.getInstance().listTables(
    new Empty(),
    (error, response) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.json(response.toObject());
    },
  );
});

router.delete('/tables/:tableName', (req: Request, res: Response) => {
  const tableName = req.params.tableName;
  SchemaManagementClient.getInstance().dropTable(
    new DropTableRequest().setTableName(tableName),
    (error, response) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.json(response.toObject());
    },
  );
});

router.get('/tables/:tableName/columns', (req: Request, res: Response) => {
  const tableName = req.params.tableName;
  SchemaManagementClient.getInstance().listColumns(
    new ListColumnsRequest().setTableName(tableName),
    (error, response) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      const result: ColumnsList = {
        columnsList: [],
        foreignKeysList: [],
      };

      response.getColumnsList().forEach((column) => {
        result.columnsList.push({
          columnName: column.getName(),
          columnType: getColumnType(column),
          columnDefault: column.getDefaultValue(),
          isNotNullable: column.getNotNullable(),
          isUnique: column.getIsUnique(),
        });
      });

      response.getForeignKeysList().forEach((foreignKey) => {
        result.foreignKeysList.push({
          columnName: foreignKey.getColumnName(),
          referenceTableName: foreignKey.getReferenceTableName(),
          referenceColumnName: foreignKey.getReferenceColumnName(),
          onUpdate: getReferenialActionFromEnum(foreignKey.getOnUpdate()),
          onDelete: getReferenialActionFromEnum(foreignKey.getOnDelete()),
        });
      });

      return res.json(result);
    },
  );
});

router.delete(
  '/tables/:tableName/columns/:columnName',
  (req: Request, res: Response) => {
    const tableName = req.params.tableName;
    const columnName = req.params.columnName;

    SchemaManagementClient.getInstance().dropColumn(
      new DropColumnRequest().setTableName(tableName).setColumnName(columnName),
      (error, response) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        return res.json(response.toObject());
      },
    );
  },
);

router.post(
  '/tables/:tableName/foreign-keys',
  (req: Request, res: Response) => {
    const addForeignKeyDetails: AddForeignKeyDetails = req.body;

    // prepare the grpc request
    const request = new AddForeignKeyRequest()
      .setTableName(addForeignKeyDetails.tableName)
      .setForeignKey(
        new ForeignKey()
          .setColumnName(addForeignKeyDetails.foriegnKeyDetails.columnName)
          .setReferenceTableName(
            addForeignKeyDetails.foriegnKeyDetails.referenceTableName,
          )
          .setReferenceColumnName(
            addForeignKeyDetails.foriegnKeyDetails.referenceColumnName,
          )
          .setOnUpdate(
            getReferenialActionFromString(
              addForeignKeyDetails.foriegnKeyDetails.onUpdate,
            ),
          )
          .setOnDelete(
            getReferenialActionFromString(
              addForeignKeyDetails.foriegnKeyDetails.onDelete,
            ),
          ),
      );

    SchemaManagementClient.getInstance().addForeignKey(
      request,
      (error, response) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        return res.json(response.toObject());
      },
    );
  },
);

router.delete(
  '/tables/:tableName/foreign-keys/:columnName',
  (req: Request, res: Response) => {
    const tableName = req.params.tableName;
    const columnName = req.params.columnName;

    SchemaManagementClient.getInstance().dropForeignKey(
      new DropForeignKeyRequest()
        .setTableName(tableName)
        .setColumnName(columnName),
      (error, response) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        return res.json(response.toObject());
      },
    );
  },
);
