import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HTTP_UNAUTHORIZED } from '../constants/http_status';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables. Please create a .env file in the backend folder with JWT_SECRET=your_secret_key');
  }
  return secret;
};

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(HTTP_UNAUTHORIZED).send('Unauthorized!');
    return;
  }

  try {
    const JWT_SECRET = getJwtSecret();
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      isAdmin: boolean;
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(HTTP_UNAUTHORIZED).send('Invalid token!');
  }
};

export default auth;

