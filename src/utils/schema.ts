import {
  Column,
  IntegerColumnType,
} from '../protobufs/schema-service-protobutfs/schema-service_pb';

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

  if (column.hasVarcharColumn()) {
    // get the length of the varchar column
    const length = column.getVarcharColumn()?.getLength() ?? '';

    return `varchar(${length})`;
  }

  if (column.hasBoolColumn()) {
    return 'bool';
  }

  if (column.hasTimestampColumn()) {
    return 'timestamp';
  }

  return 'unknown';
};
