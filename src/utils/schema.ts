import {
  Column,
  IntegerColumnType,
  ReferentialAction,
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
