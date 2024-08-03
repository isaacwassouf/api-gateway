import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { UserManagementClient } from '../../services/users';
import { User as UserProto } from '../../protobufs/users-management-service/users-management_pb';
import { User } from '../../types/auth';
import { ensureAuthenticated } from '../../middlewares/auth';

// Create a new router
export const router = express.Router();

router.get(
  '/',
  ensureAuthenticated,
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
