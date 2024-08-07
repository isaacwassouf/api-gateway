import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const ensureAdminAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // check if the jwt access token is present and valid
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    if (decoded?.user?.is_admin) {
      return next();
    }

    return res.status(401).json({ error: 'Unauthorized' });
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // check if the jwt access token is present and valid
  let accessToken = req.cookies.accessToken;
  // check if the jwt is in the authorization header

  if (!accessToken) {
    // check if the jwt is in the authorization header
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    accessToken = token;
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    // add the user to the request object
    res.locals.user = decoded.user;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
