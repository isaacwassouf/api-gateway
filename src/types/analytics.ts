export interface LogEntry {
  service: string;
  message: string;
  createdAt: string;
  level: string;
  metaData: string;
}

export interface LogsList {
  logs: LogEntry[];
}
