// ============================================================
// MAYAD - WATCHLIST ROUTES
// ============================================================

import express, { Router } from 'express';

import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from '../controllers/watchlistController';

import authMiddleware from '../middleware/authMiddleware';

const router: Router = express.Router();

// ============================================================
// PROTECTED WATCHLIST ROUTES
// ============================================================

// Get logged-in user's watchlist
// GET /api/watchlist
router.get('/', authMiddleware, getWatchlist);

// Add movie to watchlist
// POST /api/watchlist
router.post('/', authMiddleware, addToWatchlist);

// Remove movie from watchlist
// DELETE /api/watchlist/:slug
router.delete('/:slug', authMiddleware, removeFromWatchlist);

// ============================================================
// EXPORT
// ============================================================

export default router;