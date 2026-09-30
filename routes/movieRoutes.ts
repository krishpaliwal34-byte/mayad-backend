
import { Router } from "express";

import { adminAuth } from "../middleware/adminAuthMiddleware";

import {
  getAllMovies,
  getTop5Movies,
  getTrendingMovies,
  getMostLikedMovies,
  getMayadOriginals,
  getSeries,
  getMovieBySlug,
  getAdminMovies,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movieController";

import {
  adminSearchArtists,
  adminAssignRole,
  adminGetMovieRoles,
  adminUpdateRole,
  adminRemoveRole,
} from "../controllers/movieRoleController";

const router = Router();

// ============================================================
// PUBLIC MOVIE ROUTES
// ============================================================

// Get all published movies
router.get("/", getAllMovies);

// Get Top 5 movies
router.get("/top5", getTop5Movies);

// Get trending movies
router.get("/trending", getTrendingMovies);

// Get most liked movies
router.get("/most-liked", getMostLikedMovies);

// Get MAYAD Originals
router.get("/originals", getMayadOriginals);

// Get TV shows
router.get("/series", getSeries);

// ============================================================
// PROTECTED ADMIN MOVIE & ROLE ROUTES
// All routes below require admin authentication
// ============================================================

// Search artists for role assignment
router.get("/admin/artists/search", adminAuth, adminSearchArtists);

// Get all movies including unpublished
router.get("/admin/all", adminAuth, getAdminMovies);

// Add a movie or series
router.post("/admin", adminAuth, createMovie);

// Update a movie
router.put("/admin/:id", adminAuth, updateMovie);

// Delete a movie
router.delete("/admin/:id", adminAuth, deleteMovie);

// Cast & Role management routes
router.post("/admin/:movieId/roles", adminAuth, adminAssignRole);
router.get("/admin/:movieId/roles", adminAuth, adminGetMovieRoles);
router.put("/admin/roles/:roleId", adminAuth, adminUpdateRole);
router.delete("/admin/roles/:roleId", adminAuth, adminRemoveRole);

// ============================================================
// PUBLIC: GET MOVIE BY SLUG
// Keep this route after the static routes above
// ============================================================

router.get("/:slug", getMovieBySlug);

export default router;
