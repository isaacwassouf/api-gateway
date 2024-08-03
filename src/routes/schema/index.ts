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
  AddColumnRequest,
  Column,
  CreateTableRequest,
} from '../../protobufs/schema-service-protobutfs/schema-service_pb';
import {
  AddForeignKeyDetails,
  ColumnsList,
  NewColumnDetails,
  AddTableDetails,
} from '../../types/schema';
import {
  getColumnType,
  getReferenialActionFromEnum,
  getReferenialActionFromString,
  setColumnRequestType,
} from '../../utils/schema';
import { logger } from '../../middlewares';
import { validateData } from '../../middlewares/validate-data';
import {
  addForeignKeySchema,
  addColumnSchema,
  createTableSchema,
} from '../../validation-schemas/schemas';
import { ensureAdminAuthenticated } from '../../middlewares/auth';

// Create a new router
export const router = express.Router();

router.post(
  '/tables',
  ensureAdminAuthenticated,
  validateData(createTableSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const table: AddTableDetails = req.body;

    // preare the grpc request
    const request = new CreateTableRequest()
      .setTableName(table.tableName)
      .setTableComment(table.tableComment);

    table.columns.forEach((column) => {
      const newColumn = new Column();
      newColumn.setName(column.columnName);
      // set the column type
      setColumnRequestType(newColumn, column);

      newColumn.setIsUnique(column.isUnique);
      newColumn.setNotNullable(column.isNotNullable);
      newColumn.setDefaultValue(column.columnDefault);

      request.addColumns(newColumn);
    });

    SchemaManagementClient.getInstance().createTable(
      request,
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json(response.toObject());

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Table created successfully';
        }

        next();
      },
    );
  },
  logger,
);

router.get(
  '/tables',
  ensureAdminAuthenticated,
  (req: Request, res: Response, next: NextFunction) => {
    SchemaManagementClient.getInstance().listTables(
      new Empty(),
      (error, response) => {
        if (error) {
          // return the error
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
          // return the response
          res.json(response.toObject());
          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Tables listed successfully';
        }

        next();
      },
    );
  },
  logger,
);

router.delete(
  '/tables/:tableName',
  ensureAdminAuthenticated,
  (req: Request, res: Response, next: NextFunction) => {
    const tableName = req.params.tableName;
    SchemaManagementClient.getInstance().dropTable(
      new DropTableRequest().setTableName(tableName),
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json(response.toObject());
          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Table dropped successfully';
        }

        next();
      },
    );
  },
  logger,
);

router.get(
  '/tables/:tableName/columns',
  ensureAdminAuthenticated,
  (req: Request, res: Response, next: NextFunction) => {
    const tableName = req.params.tableName;
    SchemaManagementClient.getInstance().listColumns(
      new ListColumnsRequest().setTableName(tableName),
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
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

          res.json(result);

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Columns listed successfully';
        }

        next();
      },
    );
  },
  logger,
);

router.delete(
  '/tables/:tableName/columns/:columnName',
  ensureAdminAuthenticated,
  (req: Request, res: Response, next: NextFunction) => {
    const tableName = req.params.tableName;
    const columnName = req.params.columnName;

    SchemaManagementClient.getInstance().dropColumn(
      new DropColumnRequest().setTableName(tableName).setColumnName(columnName),
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json(response.toObject());
          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Column dropped successfully';
        }

        next();
      },
    );
  },
  logger,
);

router.post(
  '/tables/:tableName/foreign-keys',
  ensureAdminAuthenticated,
  validateData(addForeignKeySchema),
  (req: Request, res: Response, next: NextFunction) => {
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
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json(response.toObject());
          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Foreign key added successfully';
        }

        next();
      },
    );
  },
  logger,
);

router.delete(
  '/tables/:tableName/foreign-keys/:columnName',
  ensureAdminAuthenticated,
  (req: Request, res: Response, next: NextFunction) => {
    const tableName = req.params.tableName;
    const columnName = req.params.columnName;

    SchemaManagementClient.getInstance().dropForeignKey(
      new DropForeignKeyRequest()
        .setTableName(tableName)
        .setColumnName(columnName),
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });
          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json(response.toObject());

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Foreign key dropped successfully';
        }

        next();
      },
    );
  },
  logger,
);

router.post(
  '/tables/:tableName/columns',
  ensureAdminAuthenticated,
  validateData(addColumnSchema),
  (req: Request, res: Response, next: NextFunction) => {
    const tableName = req.params.tableName;
    const newColumnDetails: NewColumnDetails = req.body;

    const column = new Column();
    column.setName(newColumnDetails.columnName);
    // set the column type
    setColumnRequestType(column, newColumnDetails);

    column.setIsUnique(newColumnDetails.isUnique);
    column.setNotNullable(newColumnDetails.isNotNullable);
    column.setDefaultValue(newColumnDetails.columnDefault);

    const request = new AddColumnRequest()
      .setTableName(tableName)
      .setColumn(column);

    SchemaManagementClient.getInstance().addColumn(
      request,
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });

          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json(response.toObject());

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Column added successfully';
        }

        next();
      },
    );
  },
  logger,
);
