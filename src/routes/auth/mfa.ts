import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { UserManagementClient } from '../../services/users';
import { logger } from '../../middlewares';

// Create a new router
export const router = express.Router();

router.patch(
  '/toggle',
  async (req: Request, res: Response, next: NextFunction) => {
    UserManagementClient.getInstance().toggleMFA(
      new Empty(),
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });

          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json({ message: 'MFA toggled successfully' });

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Auth provider enabled successfully';
        }

        next();
      },
    );
  },
  logger,
);
