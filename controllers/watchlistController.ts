import { Request, Response } from 'express';
import User from '../models/User';


export const getWatchlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as Request & {
      userId?: string;
    }).userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });

      return;
    }

    const user = await User.findById(userId).select('watchlist');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });

      return;
    }

    res.status(200).json({
      success: true,
      watchlist: user.watchlist || [],
    });
  } catch (error) {
    console.error('Get Watchlist Error:', error);

    res.status(500).json({
      success: false,
      message: 'Something went wrong while getting watchlist',
    });
  }
};

// ============================================================
// ADD TO WATCHLIST
// ============================================================
// POST /api/watchlist
// Body: { "slug": "movie-slug" }
// ============================================================

export const addToWatchlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as Request & {
      userId?: string;
    }).userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });

      return;
    }

    const { slug } = req.body;

    if (!slug || typeof slug !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Movie slug is required',
      });

      return;
    }

    const cleanSlug = slug.trim();

    if (!cleanSlug) {
      res.status(400).json({
        success: false,
        message: 'Movie slug is required',
      });

      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });

      return;
    }

    // Already added hai to duplicate nahi banega
    if (!user.watchlist.includes(cleanSlug)) {
      user.watchlist.push(cleanSlug);
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Movie added to watchlist',
      watchlist: user.watchlist,
    });
  } catch (error) {
    console.error('Add Watchlist Error:', error);

    res.status(500).json({
      success: false,
      message: 'Something went wrong while adding movie',
    });
  }
};

// ============================================================
// REMOVE FROM WATCHLIST
// ============================================================
// DELETE /api/watchlist/:slug
// ============================================================

export const removeFromWatchlist = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as Request & {
      userId?: string;
    }).userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });

      return;
    }

    const { slug } = req.params;

    if (!slug || typeof slug !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Movie slug is required',
      });

      return;
    }

    const cleanSlug = slug.trim();

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });

      return;
    }

    user.watchlist = user.watchlist.filter(
      (movieSlug) => movieSlug !== cleanSlug
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Movie removed from watchlist',
      watchlist: user.watchlist,
    });
  } catch (error) {
    console.error('Remove Watchlist Error:', error);

    res.status(500).json({
      success: false,
      message: 'Something went wrong while removing movie',
    });
  }
};