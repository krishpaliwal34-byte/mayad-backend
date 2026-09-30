// ============================================================
// MAYAD ARTIST PORTAL — ARTIST AUTH MIDDLEWARE
// Verifies JWT token from HttpOnly Cookie or Bearer Authorization header
// ============================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Artist from '../models/Artist';

export interface ArtistAuthRequest extends Request {
  userId?: string;
  artist?: any;
}

export const artistAuthMiddleware = async (
  req: ArtistAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check HttpOnly Cookie first
    if (req.cookies && req.cookies.artist_token) {
      token = req.cookies.artist_token;
    }
    // Fallback to Bearer Authorization Header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to access artist portal.',
      });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({
        success: false,
        message: 'JWT_SECRET is not configured on server',
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, secret) as { userId: string; role?: string };
    
    if (!decoded || !decoded.userId) {
      res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      });
      return;
    }

    // Find artist in database
    const artist = await Artist.findById(decoded.userId);
    if (!artist) {
      res.status(401).json({
        success: false,
        message: 'Artist account not found',
      });
      return;
    }

    req.userId = artist._id.toString();
    req.artist = artist;

    next();
  } catch (error) {
    console.error('Artist Auth Middleware Error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please sign in again.',
    });
  }
};

export default artistAuthMiddleware;
