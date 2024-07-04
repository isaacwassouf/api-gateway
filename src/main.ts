import * as dotenv from 'dotenv';

dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// import the router from Google.ts
import { router as authRouter } from './routes/auth';
import { router as googleRouter } from './routes/auth/google';
import { router as schemaRouter } from './routes/schema';
import { router as contentsRouter } from './routes/contents';
import { router as analyticsRouter } from './routes/analytics';
import { router as adminRouter } from './routes/auth/admin';

import { UserManagementClient } from './services/users';
import { SchemaManagementClient } from './services/schema';
import { ContentManagementClient } from './services/contents';
import { AnalyticsClient } from './services/analytics';

const server: Express = express();

// parse the request body as json
server.use(express.json());

// use the cookie parser middleware
server.use(cookieParser());

server.use((req, res, next) => {
  console.log(req.cookies);
  next();
});

// use the cors middleware
const whitelist = [process.env.DASHBOARD_BASE_URL, process.env.CLIENT_BASE_URL];
server.use(
  cors({
    origin: function(origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);
// use the router
server.use('/api/auth/providers', authRouter);
server.use('/api/auth/admin', adminRouter);
server.use('/api/auth/google', googleRouter);
server.use('/api/schema', schemaRouter);
server.use('/api/contents', contentsRouter);
server.use('/api/analytics', analyticsRouter);

server.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
  // initialize the schema management Client
  SchemaManagementClient.getInstance();

  // initialize the contents management client
  ContentManagementClient.getInstance();

  // initialize the user management client
  UserManagementClient.getInstance();

  // initialize the analytics Client
  AnalyticsClient.getInstance();
});
