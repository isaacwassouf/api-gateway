import express from 'express';
import { Request, Response } from 'express';
import {
  GitHubTokenResponse,
  exchangeGitHubCodeWithTokens,
} from '../../utils/auth';
import { UserManagementClient } from '../../services/users';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { GitHubEmailResponse, GitHubUserResponse } from '../../types/auth';
import { GitHubLoginRequest } from '../../protobufs/users-management-service/users-management_pb';

// Create a new router
export const router = express.Router();

router.get('/login', (_: Request, res: Response) => {
  UserManagementClient.getInstance().getGitHubAuthorizationUrl(
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

  try {
    // exchange the code for the access and ID tokens
    const tokenResponse: GitHubTokenResponse =
      await exchangeGitHubCodeWithTokens(code as string);

    //  access the user data though the user endpoint
    const userEndoint = 'https://api.github.com/user';
    const userEmailEndpoint = 'https://api.github.com/user/emails';

    // send the two requests in parallel
    const [userResponse, userEmailResponse] = await Promise.all([
      fetch(userEndoint, {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      }),
      fetch(userEmailEndpoint, {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      }),
    ]);

    // parse the responses
    const userData: GitHubUserResponse = await userResponse.json();
    const userEmailData: GitHubEmailResponse[] = await userEmailResponse.json();

    console.log('userData', userData);
    console.log(userEmailData, userEmailData);

    // get the primary emails
    const primaryEmail = userEmailData.find(
      (email) => email.primary && email.visibility === 'public',
    );

    const githubLoginRequest: GitHubLoginRequest = new GitHubLoginRequest();
    githubLoginRequest.setIdentifier(userData.id.toString());
    githubLoginRequest.setName(userData.name);
    githubLoginRequest.setEmail(primaryEmail?.email ?? '');

    // handle the login request
    UserManagementClient.getInstance().handleGitHubLogin(
      githubLoginRequest,
      (err, response) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.cookie('token', response.getToken(), { httpOnly: false });
        res.redirect(process.env.CLIENT_REDIRECT_AFTER_LOGIN as string);
      },
    );
  } catch (err) {
    return res.status(500).json({ error: 'error processing github request' });
  }
});
