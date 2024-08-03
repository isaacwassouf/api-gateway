import Joi from 'joi';

export const createTableSchema = Joi.object({
  tableName: Joi.string().alphanum().required(),
  tableComment: Joi.string().alphanum().required().allow(''),
  columns: Joi.array()
    .items(
      Joi.object({
        columnName: Joi.string().alphanum().min(3).max(30).required(),
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
  columnName: Joi.string().alphanum().min(3).max(30).required(),
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
    columnName: Joi.string().alphanum().required(),
    referenceTableName: Joi.string().alphanum().required(),
    referenceColumnName: Joi.string().alphanum().required(),
    onUpdate: Joi.string().alphanum().required(),
    onDelete: Joi.string().alphanum().required(),
  }),
});
