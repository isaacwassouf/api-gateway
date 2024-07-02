import express from 'express';
import { Request, Response } from 'express';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { UserManagementClient } from '../../services/users';
import {
  DisableAuthProviderRequest,
  EnableAuthProviderRequest,
  SetAuthProviderCredentialsRequest,
} from '../../protobufs/users-management-service/users-management_pb';
import { AuthProvider, AuthProvidersList } from '../../types/auth';

// Create a new router
export const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  UserManagementClient.getInstance().listAuthProviders(
    new Empty(),
    (error, response) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

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

      return res.json(responseData);
    },
  );
});

router.patch('/:id/enable', async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: 'Missing provider ID' });
  }

  UserManagementClient.getInstance().enableAuthProvider(
    new EnableAuthProviderRequest().setAuthProviderId(parseInt(id)),
    (error, response) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json({ message: response.getMessage() });
    },
  );
});

router.patch('/:id/disable', async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: 'Missing provider ID' });
  }

  UserManagementClient.getInstance().disableAuthProvider(
    new DisableAuthProviderRequest().setAuthProviderId(parseInt(id)),
    (error, response) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json({ message: response.getMessage() });
    },
  );
});

router.patch('/:id/credentials', async (req: Request, res: Response) => {
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
        return res.status(500).json({ error: error.message });
      }

      return res.json({ message: response.getMessage() });
    },
  );
});
