import { ServiceError } from '@grpc/grpc-js';

declare global {
  namespace Express {
    interface Locals {
      callError: ServiceError | null;
      callResponse: any;
      defaultMessage: string;
    }
  }
}
