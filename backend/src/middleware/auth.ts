import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check for 'Bearer <token>' in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token using your secret from .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };

      // Attach user info to the request for use in controllers
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Admins only' });
};

export const isAgent = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'AGENT' || req.user.role === 'ADMIN')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Agents only' });
};