import express from 'express';
import { Request, Response } from 'express';
import {
  TokenResponse,
  exchangeCodeWithTokens,
  verifyIDToken,
} from '../../utils/auth';
import { JwtPayload } from 'jsonwebtoken';
import { UserManagementClient } from '../../services/users';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { GoogleLoginRequest } from '../../protobufs/users-management-service/users-management_pb';

// Create a new router
export const router = express.Router();

router.get('/login', (req: Request, res: Response) => {
  UserManagementClient.getInstance().getGoogleAuthorizationUrl(
    new Empty(),
    (err, response) => {
      if (err) {
        res.status(500).json({ error: err.message });
      }
      res.json({ url: response.getUrl() });
    },
  );
});

router.get('/callback', async (req: Request, res: Response) => {
  // get the code from the request query
  const code = req.query.code;

  // exchange the code for the access and ID tokens
  const tokenResponse: TokenResponse = await exchangeCodeWithTokens(
    code as string,
  );

  // verify the ID token
  const payload: JwtPayload = await verifyIDToken(tokenResponse.id_token);

  // create a new GoogleLoginRequest message
  const message: GoogleLoginRequest = new GoogleLoginRequest();
  message.setName(payload.name);
  message.setEmail(payload.email);
  message.setIdentifier(payload.sub as string);

  // handle the login request
  UserManagementClient.getInstance().handleGoogleLogin(
    message,
    (err, response) => {
      if (err) {
        res.status(500).json({ error: err.message });
      }
      res.cookie('token', response.getToken(), { httpOnly: false });
      res.redirect(process.env.CLIENT_REDIRECT_AFTER_LOGIN as string);
    },
  );
});
