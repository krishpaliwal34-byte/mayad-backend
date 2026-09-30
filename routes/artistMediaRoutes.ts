import express, { Router } from "express";
import multer from "multer";

import artistAuthMiddleware from "../middleware/artistAuthMiddleware";
import { adminAuth } from "../middleware/adminAuthMiddleware";

import {
  uploadMedia,
  getMyMedia,
  updateMyMedia,
  deleteMyMedia,
  getPublicArtistMedia,
  getPublicAllMedia,
  adminGetAllMedia,
  adminUpdateMediaStatus,
  adminDeleteMedia,
} from "../controllers/artistMediaController";

const router: Router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max for video reels and photos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image (JPG, PNG, WebP) and video (MP4, MOV, WebM) files are allowed"));
    }
  },
});

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get("/public", getPublicAllMedia);
router.get("/public/:artistId", getPublicArtistMedia);

// ==========================================
// ARTIST AUTHENTICATED ROUTES
// ==========================================
router.post(
  "/upload",
  artistAuthMiddleware,
  upload.single("file"),
  uploadMedia
);
router.get("/my-media", artistAuthMiddleware, getMyMedia);
router.put("/:id", artistAuthMiddleware, updateMyMedia);
router.delete("/:id", artistAuthMiddleware, deleteMyMedia);

// ==========================================
// ADMIN AUTHENTICATED ROUTES
// ==========================================
router.get("/admin/all", adminAuth, adminGetAllMedia);
router.put("/admin/:id/status", adminAuth, adminUpdateMediaStatus);
router.delete("/admin/:id", adminAuth, adminDeleteMedia);

export default router;
