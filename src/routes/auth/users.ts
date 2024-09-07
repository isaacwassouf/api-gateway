import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { UserManagementClient } from '../../services/users';
import {
  ConfirmPasswordResetRequest,
  LoginRequest,
  LogoutRequest,
  RegisterRequest,
  RequestEmailVerificationRequest,
  RequestPasswordResetRequest,
  User as UserProto,
  VerifyEmailRequest,
} from '../../protobufs/users-management-service/users-management_pb';
import { User } from '../../types/auth';
import {
  ensureAdminAuthenticated,
  ensureAuthenticated,
} from '../../middlewares/auth';
import { logger } from '../../middlewares';

// Create a new router
export const router = express.Router();

router.get(
  '/',
  ensureAdminAuthenticated,
  (req: Request, res: Response, next: NextFunction) => {
    const call = UserManagementClient.getInstance().listUsers(new Empty());
    // Create an array to store the users
    const users: User[] = [];

    // Listen for data
    call.on('data', (user: UserProto) => {
      users.push({
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail(),
        isVerified: user.getIsVerified(),
        authProvider: user.getAuthProvider(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
      });
    });

    // Listen for the end of the stream
    call.on('end', () => {
      res.json({ users });
      next();
    });

    // Listen for errors
    call.on('error', (error) => {
      res.status(500).json({ error: error.message });
      next();
    });
  },
);

router.post(
  '/register',
  (req: Request, res: Response, next: NextFunction) => {
    UserManagementClient.getInstance().registerUser(
      new RegisterRequest()
        .setName(req.body.name)
        .setEmail(req.body.email)
        .setPassword(req.body.password)
        .setPasswordConfirmation(req.body.passwordConfirmation),
      (err, response) => {
        if (err) {
          res.status(500).json({ error: err.message });

          // set the error in the locals
          res.locals.callError = err;
        } else {
          res.json({ message: response.getMessage() });

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage =
            'User registered successfully. Please verify your email to login.';
        }

        next();
      },
    );
  },
  logger,
);

router.post(
  '/login',
  (req: Request, res: Response, next: NextFunction) => {
    UserManagementClient.getInstance().loginUser(
      new LoginRequest()
        .setEmail(req.body.email)
        .setPassword(req.body.password),
      (err, response) => {
        if (err) {
          res.status(500).json({ error: err.message });

          // set the error in the locals
          res.locals.callError = err;
        } else {
          const accesstToken = response.getToken();
          if (accesstToken) {
            res.json({ accesstToken });
          } else {
            res.json({ message: response.getMessage() });
          }

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Login request successful.';
        }

        next();
      },
    );
  },
  logger,
);

router.post(
  '/logout',
  ensureAuthenticated,
  (_: Request, res: Response, next: NextFunction) => {
    const gRPCRequest = new LogoutRequest();
    gRPCRequest.setJti(res.locals.jti || '');
    gRPCRequest.setUserId(res.locals.user?.id || 0);

    UserManagementClient.getInstance().logoutUser(
      gRPCRequest,
      (err, response) => {
        if (err) {
          res.status(500).json({ error: err.message });

          // set the error in the locals
          res.locals.callError = err;
        } else {
          res.json({ message: "You've been logged out." });
          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Logout request successful.';
        }

        next();
      },
    );
  },
  logger,
);

router.post(
  '/request-email-verification',
  (req: Request, res: Response, next: NextFunction) => {
    UserManagementClient.getInstance().requestEmailVerification(
      new RequestEmailVerificationRequest().setEmail(req.body.email),
      (err, response) => {
        if (err) {
          res.status(500).json({ error: err.message });

          // set the error in the locals
          res.locals.callError = err;
        } else {
          res.json({ message: response.getMessage() });

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage =
            'Email verification request sent successfully';
        }

        next();
      },
    );
  },
  logger,
);

router.post(
  '/confirm-email-verification',
  (req: Request, res: Response, next: NextFunction) => {
    UserManagementClient.getInstance().verifyEmail(
      new VerifyEmailRequest().setToken(req.body.code),
      (err, response) => {
        if (err) {
          res.status(500).json({ error: err.message });

          // set the error in the locals
          res.locals.callError = err;
        } else {
          res.json({ message: response.getMessage() });

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage =
            'Email verification successful. You can now login with your email.';
        }

        next();
      },
    );
  },
  logger,
);

router.post(
  '/request-password-reset',
  (req: Request, res: Response, next: NextFunction) => {
    UserManagementClient.getInstance().requestPasswordReset(
      new RequestPasswordResetRequest().setEmail(req.body.email),
      (err, response) => {
        if (err) {
          res.status(500).json({ error: err.message });

          // set the error in the locals
          res.locals.callError = err;
        } else {
          res.json({ message: response.getMessage() });

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage =
            'Password reset request sent successfully';
        }

        next();
      },
    );
  },
  logger,
);

router.post(
  '/confirm-password-reset',
  (req: Request, res: Response, next: NextFunction) => {
    UserManagementClient.getInstance().confirmPasswordReset(
      new ConfirmPasswordResetRequest()
        .setCode(req.body.code)
        .setPassword(req.body.password)
        .setPasswordConfirmation(req.body.passwordConfirmation),
      (err, response) => {
        if (err) {
          res.status(500).json({ error: err.message });

          // set the error in the locals
          res.locals.callError = err;
        } else {
          res.json({ message: response.getMessage() });

          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage =
            'Password reset successful. You can now login with your new password.';
        }

        next();
      },
    );
  },
  logger,
);
