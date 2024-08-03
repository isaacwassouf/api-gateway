import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import { UserManagementClient } from '../../services/users';
import {
  LoginRequest,
  RegisterAdminRequest,
} from '../../protobufs/users-management-service/users-management_pb';
import { LoginAdminData, RegisterAdminData } from '../../types/auth';
import { logger } from '../../middlewares';
import { validateData } from '../../middlewares/validate-data';
import {
  loginAdminSchema,
  registerAdminSchema,
} from '../../validation-schemas/admins';

// Create a new router
export const router = express.Router();

router.post(
  '/register',
  validateData(registerAdminSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const data: RegisterAdminData = req.body;

    // prepare the grpc request
    const request = new RegisterAdminRequest();
    request.setEmail(data.email);
    request.setPassword(data.password);
    request.setPasswordConfirmation(data.passwordConfirmation);

    UserManagementClient.getInstance().registerAdmin(
      request,
      (err, response) => {
        if (err) {
          res.status(500).json({ error: err.message });
          // set the error in the locals
          res.locals.callError = err;
        } else {
          res.json({ message: response.getMessage() });
          // set the response in the locals
          res.locals.callResponse = response;
          res.locals.defaultMessage = 'Admin registered successfully';
        }

        next();
      },
    );
  },
  logger,
);

router.post(
  '/login',
  validateData(loginAdminSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const data: LoginAdminData = req.body;

    const request = new LoginRequest();
    request.setEmail(data.email);
    request.setPassword(data.password);

    UserManagementClient.getInstance().loginAdmin(request, (err, response) => {
      if (err) {
        res.status(500).json({ error: err.message });
        // set the error in the locals
        res.locals.callError = err;
      } else {
        res.cookie('token', response.getToken(), {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
        });
        res.json({ message: response.getMessage() });
        // set the response in the locals
        res.locals.callResponse = response;
        res.locals.defaultMessage = 'Admin registered successfully';
      }

      next();
    });
  },
  logger,
);

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});
