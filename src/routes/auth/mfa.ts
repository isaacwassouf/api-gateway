import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { UserManagementClient } from '../../services/users';
import { logger } from '../../middlewares';
import { ensureAdminAuthenticated } from '../../middlewares/auth';
import { ConfirmMFARequest } from '../../protobufs/users-management-service/users-management_pb';

// Create a new router
export const router = express.Router();

router.patch(
  '/toggle',
  ensureAdminAuthenticated,
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

router.post(
  '/confirm',
  (req: Request, res: Response, next: NextFunction) => {
    UserManagementClient.getInstance().confirmMFA(
      new ConfirmMFARequest().setCode(req.body.code),
      (err, response) => {
        if (err) {
          res.status(500).json({ error: err.message });

          // set the error in the locals
          res.locals.callError = err;
        } else {
          res.json({ accessToken: response.getToken() });

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage =
            'MFA confirmed successfully, token set in the cookie';
        }

        next();
      },
    );
  },
  logger,
);
