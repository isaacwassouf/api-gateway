import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import {
  Column,
  DecimalColumn,
  FixedPointColumn,
  FixedPointColumnType,
  IntegerColumn,
  IntegerColumnType,
  ReferentialAction,
  VarCharColumn,
} from '../protobufs/schema-service-protobutfs/schema-service_pb';
import { NewColumnDetails } from '../types/schema';

// the columns type if a oneof field, we need to represent it as a string
export const getColumnType = (column: Column) => {
  if (column.hasIntColumn()) {
    // check if it is signed or unsigned
    const isUnSigned = column.getIntColumn()?.getIsUnsigned();

    // map the enum type to a string
    switch (column.getIntColumn()?.getType()) {
      case IntegerColumnType.INT:
        return isUnSigned ? 'uint32' : 'int32';
      case IntegerColumnType.BIGINT:
        return isUnSigned ? 'uint64' : 'int64';
      case IntegerColumnType.MEDIUMINT:
        return isUnSigned ? 'uint24' : 'int24';
      case IntegerColumnType.SMALLINT:
        return isUnSigned ? 'uint16' : 'int16';
      default:
        return 'unknown';
    }
  }

  if (column.hasDecimalColumn()) {
    // get the precision and scale of the decimal column
    const precision = column.getDecimalColumn()?.getPrecision();
    const scale = column.getDecimalColumn()?.getScale();

    return `decimal(${precision},${scale})`;
  }

  if (column.hasFixedPointColumn()) {
    // get the precision of the fixed point column
    const precision = column.getFixedPointColumn()?.getPrecision();

    if (
      column.getFixedPointColumn()?.getType() === FixedPointColumnType.FLOAT
    ) {
      return `float(${precision})`;
    }

    return `double(${precision})`;
  }

  if (column.hasVarcharColumn()) {
    // get the length of the varchar column
    const length = column.getVarcharColumn()?.getLength() ?? '';

    return `varchar(${length})`;
  }

  if (column.hasTextColumn()) {
    return 'text';
  }

  if (column.hasBoolColumn()) {
    return 'bool';
  }

  if (column.hasTimestampColumn()) {
    return 'timestamp';
  }

  return 'unknown';
};

export const getReferenialActionFromEnum = (
  action: ReferentialAction,
): string => {
  switch (action) {
    case ReferentialAction.CASCADE:
      return 'Cascade';
    case ReferentialAction.RESTRICT:
      return 'Restrict';
    case ReferentialAction.SET_NULL:
      return 'Set Null';
    case ReferentialAction.NO_ACTION:
      return 'No Action';
    default:
      return 'Unknown';
  }
};

export const getReferenialActionFromString = (
  action: string,
): ReferentialAction => {
  switch (action) {
    case 'Cascade':
      return ReferentialAction.CASCADE;
    case 'Restrict':
      return ReferentialAction.RESTRICT;
    case 'Set Null':
      return ReferentialAction.SET_NULL;
    case 'No Action':
      return ReferentialAction.NO_ACTION;
    default:
      return ReferentialAction.NO_ACTION;
  }
};

export const setColumnRequestType = (
  column: Column,
  newColumnDetails: NewColumnDetails,
) => {
  if (newColumnDetails.columnType === 'uint16') {
    return column.setIntColumn(
      new IntegerColumn()
        .setType(IntegerColumnType.SMALLINT)
        .setIsUnsigned(true),
    );
  }

  if (newColumnDetails.columnType === 'int16') {
    return column.setIntColumn(
      new IntegerColumn().setType(IntegerColumnType.SMALLINT),
    );
  }

  if (newColumnDetails.columnType === 'uint24') {
    return column.setIntColumn(
      new IntegerColumn()
        .setType(IntegerColumnType.MEDIUMINT)
        .setIsUnsigned(true),
    );
  }

  if (newColumnDetails.columnType === 'int24') {
    return column.setIntColumn(
      new IntegerColumn().setType(IntegerColumnType.MEDIUMINT),
    );
  }

  if (newColumnDetails.columnType === 'uint32') {
    return column.setIntColumn(
      new IntegerColumn().setType(IntegerColumnType.INT).setIsUnsigned(true),
    );
  }

  if (newColumnDetails.columnType === 'int32') {
    return column.setIntColumn(
      new IntegerColumn().setType(IntegerColumnType.INT),
    );
  }

  if (newColumnDetails.columnType === 'uint64') {
    return column.setIntColumn(
      new IntegerColumn().setType(IntegerColumnType.BIGINT).setIsUnsigned(true),
    );
  }

  if (newColumnDetails.columnType === 'int64') {
    return column.setIntColumn(
      new IntegerColumn().setType(IntegerColumnType.BIGINT),
    );
  }

  if (newColumnDetails.columnType === 'decimal') {
    return column.setDecimalColumn(
      new DecimalColumn()
        .setPrecision(newColumnDetails.columnPrecision)
        .setScale(newColumnDetails.columnScale),
    );
  }

  if (newColumnDetails.columnType === 'float') {
    return column.setFixedPointColumn(
      new FixedPointColumn()
        .setType(FixedPointColumnType.FLOAT)
        .setPrecision(newColumnDetails.columnPrecision),
    );
  }

  if (newColumnDetails.columnType === 'double') {
    return column.setFixedPointColumn(
      new FixedPointColumn()
        .setType(FixedPointColumnType.DOUBLE)
        .setPrecision(newColumnDetails.columnPrecision),
    );
  }

  if (newColumnDetails.columnType === 'varchar') {
    return column.setVarcharColumn(
      new VarCharColumn().setLength(newColumnDetails.columnLength),
    );
  }

  if (newColumnDetails.columnType === 'text') {
    return column.setTextColumn(new Empty());
  }

  if (newColumnDetails.columnType === 'boolean') {
    return column.setBoolColumn(new Empty());
  }

  if (newColumnDetails.columnType === 'timestamp') {
    return column.setTimestampColumn(new Empty());
  }
};
