// ============================================================
// MAYAD - AUTH MIDDLEWARE
// ============================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ============================================================
// REQUEST TYPE
// ============================================================

export interface AuthRequest extends Request {
  userId?: string;
}

// ============================================================
// AUTH MIDDLEWARE
// ============================================================

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    // Authorization header check
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });

      return;
    }

    // Token extract
    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication token is missing',
      });

      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({
        success: false,
        message: 'JWT_SECRET is not configured',
      });

      return;
    }

    // Verify JWT
    const decoded = jwt.verify(token, secret) as {
      userId: string;
    };

    // User ID request me attach
    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);

    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    });
  }
};

export default authMiddleware;