import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

// Extend Express Request type to carry user info after verification
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Verifies the JWT token sent in the Authorization header
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Token comes in header as: "Bearer eyJhbGc..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Attach user info to request so next handlers can use it
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
// Like authenticate but doesn't reject if no token
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token = guest, just continue
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    // Invalid token = treat as guest, don't reject
    next();
  }
};