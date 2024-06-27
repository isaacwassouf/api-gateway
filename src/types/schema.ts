export interface ColumnDetails {
  columnName: string;
  columnType: string;
  columnDefault: string;
  isNotNullable: boolean;
  isUnique: boolean;
}

export interface ForeignKeyDetails {
  columnName: string;
  referenceTableName: string;
  referenceColumnName: string;
  onUpdate: string;
  onDelete: string;
}

export interface ColumnsList {
  columnsList: ColumnDetails[];
  foreignKeysList: ForeignKeyDetails[];
}
