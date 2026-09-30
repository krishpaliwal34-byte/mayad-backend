import express, { Router } from "express";
import multer from "multer";
import {
  artistLogin,
  artistRegister,
  changeTemporaryPassword,
  getArtistMe,
  updateArtistProfile,
  artistLogout,
  requestPasswordReset,
  resetPassword,
  getPublicArtists,
  uploadArtistProfilePhoto,
} from "../controllers/artistController";

import {
  artistGetMyProjects,
  artistRespondRole,
  artistGetNotifications,
  artistMarkNotificationRead,
} from "../controllers/movieRoleController";

import artistAuthMiddleware from "../middleware/artistAuthMiddleware";

const router: Router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// ==========================================
// PUBLIC ARTISTS
// ==========================================

router.get("/", getPublicArtists);

router.post(
  "/upload-profile-photo",
  artistAuthMiddleware,
  upload.single("image"),
  uploadArtistProfilePhoto
);

// ==========================================
// PUBLIC AUTH ROUTES
// ==========================================

router.post("/register", artistRegister);
router.post("/login", artistLogin);

router.post(
  "/change-temporary-password",
  changeTemporaryPassword
);

router.post("/logout", artistLogout);

router.post(
  "/forgot-password",
  requestPasswordReset
);

router.post(
  "/reset-password",
  resetPassword
);

// ==========================================
// PROTECTED ARTIST PROFILE ROUTES
// ==========================================

router.get(
  "/me",
  artistAuthMiddleware,
  getArtistMe
);

router.put(
  "/me",
  artistAuthMiddleware,
  updateArtistProfile
);

// ==========================================
// PROTECTED ARTIST PROJECTS & NOTIFICATIONS
// ==========================================

router.get(
  "/my-projects",
  artistAuthMiddleware,
  artistGetMyProjects
);

router.patch(
  "/my-projects/:roleId/respond",
  artistAuthMiddleware,
  artistRespondRole
);

router.get(
  "/notifications",
  artistAuthMiddleware,
  artistGetNotifications
);

router.patch(
  "/notifications/:notificationId/read",
  artistAuthMiddleware,
  artistMarkNotificationRead
);

export default router;