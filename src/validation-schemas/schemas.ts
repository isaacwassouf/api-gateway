import Joi from 'joi';

export const createTableSchema = Joi.object({
  tableName: Joi.string()
    .regex(new RegExp('^[a-zA-Z][a-zA-Z0-9_]*$'))
    .disallow('users')
    .required(),
  tableComment: Joi.string().alphanum().required().allow(''),
  columns: Joi.array()
    .items(
      Joi.object({
        columnName: Joi.string()
          .regex(new RegExp('^[a-zA-Z][a-zA-Z0-9_]*$'))
          .disallow('id')
          .disallow('created_at')
          .disallow('updated_at')
          .disallow('creator_id')
          .required(),
        columnType: Joi.string().alphanum().required(),
        columnDefault: Joi.string().alphanum().required().allow(''),
        columnLength: Joi.number().integer().required(),
        isNotNullable: Joi.boolean().required(),
        isUnique: Joi.boolean().required(),
      }),
    )
    .min(1)
    .required(),
});

export const addColumnSchema = Joi.object({
  columnName: Joi.string()
    .regex(new RegExp('^[a-zA-Z][a-zA-Z0-9_]*$'))
    .disallow('id')
    .disallow('created_at')
    .disallow('updated_at')
    .disallow('creator_id')
    .required(),
  columnType: Joi.string().alphanum().required(),
  columnDefault: Joi.string().alphanum().allow('').required(),
  columnLength: Joi.number().integer().required(),
  isNotNullable: Joi.boolean().required(),
  isUnique: Joi.boolean().required(),
});

export const addForeignKeySchema = Joi.object({
  tableName: Joi.string().alphanum().required(),
  isNotNullable: Joi.boolean().required(),
  foriegnKeyDetails: Joi.object({
    columnName: Joi.string()
      .regex(new RegExp('^[a-zA-Z][a-zA-Z0-9_]*$'))
      .disallow('id')
      .disallow('created_at')
      .disallow('updated_at')
      .disallow('creator_id')
      .required(),
    referenceTableName: Joi.string().alphanum().required(),
    referenceColumnName: Joi.string().alphanum().required(),
    onUpdate: Joi.string().alphanum().required(),
    onDelete: Joi.string().alphanum().required(),
  }),
});
