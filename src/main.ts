import * as dotenv from 'dotenv';

dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// import the router from Google.ts
import { router as googleRouter } from './routes/auth/google';
import { router as schemaRouter } from './routes/schema';
import { router as contentsRouter } from './routes/contents';

import { UserManagementClient } from './services/users';
import { SchemaManagementClient } from './services/schema';
import { ContentManagementClient } from './services/contents';

const server: Express = express();

// parse the request body as json
server.use(express.json());

// use the cookie parser middleware
server.use(cookieParser());
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
server.use('/api/auth/google', googleRouter);
server.use('/api/schema', schemaRouter);
server.use('/api/contents', contentsRouter);

server.get('/', (req: Request, res: Response) => {
  // log the cookies
  console.log(req.cookies);
  // send the cookies
  res.json(req.cookies);
});

server.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
  // initialize the schema management Client
  SchemaManagementClient.getInstance();

  // initialize the contents management client
  ContentManagementClient.getInstance();

  // initialize the user management client
  // UserManagementClient.getInstance();
  // console.log('User Management Client initialized');
});
