import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { UserManagementClient } from '../../services/users';
import {
  DisableAuthProviderRequest,
  EnableAuthProviderRequest,
  SetAuthProviderCredentialsRequest,
} from '../../protobufs/users-management-service/users-management_pb';
import { AuthProvidersList } from '../../types/auth';
import { logger } from '../../middlewares';

// Create a new router
export const router = express.Router();

router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    UserManagementClient.getInstance().listAuthProviders(
      new Empty(),
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });

          // set the error in the locals
          res.locals.callError = error;
        } else {
          const result = response.getAuthProvidersList();
          const responseData: AuthProvidersList = {
            authProviders: [],
          };

          result.forEach((provider) => {
            responseData.authProviders.push({
              id: provider.getId(),
              name: provider.getName(),
              active: provider.getActive(),
              clientId: provider.getClientId(),
            });
          });

          res.json(responseData);

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Auth providers listed successfully';
        }

        next();
      },
    );
  },
  logger,
);

router.patch(
  '/:id/enable',
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: 'Missing provider ID' });
    }

    UserManagementClient.getInstance().enableAuthProvider(
      new EnableAuthProviderRequest().setAuthProviderId(parseInt(id)),
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });

          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json({ message: response.getMessage() });

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

router.patch(
  '/:id/disable',
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: 'Missing provider ID' });
    }

    UserManagementClient.getInstance().disableAuthProvider(
      new DisableAuthProviderRequest().setAuthProviderId(parseInt(id)),
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });

          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json({ message: response.getMessage() });

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Auth provider disabled successfully';
        }

        next();
      },
    );
  },
  logger,
);

router.patch(
  '/:id/credentials',
  async (req: Request, res: Response, next: NextFunction) => {
    const { clientId, clientSecret } = req.body;

    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: 'Missing provider ID' });
    }

    UserManagementClient.getInstance().setAuthProviderCredentials(
      new SetAuthProviderCredentialsRequest()
        .setAuthProviderId(parseInt(id))
        .setClientId(clientId)
        .setClientSecret(clientSecret),
      (error, response) => {
        if (error) {
          res.status(500).json({ error: error.message });

          // set the error in the locals
          res.locals.callError = error;
        } else {
          res.json({ message: response.getMessage() });

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage =
            'Auth Provider credentials set successfully';
        }

        next();
      },
    );
  },
);
