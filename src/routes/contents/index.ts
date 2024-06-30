import express from 'express';
import { Request, Response } from 'express';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { GetContentRequest } from '../../protobufs/content-service-protobufs/content-service_pb';
import { ContentManagementClient } from '../../services/contents';

// Create a new router
export const router = express.Router();
