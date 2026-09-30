
import { Router } from "express";

import {
  adminLogin,
  getAdminProfile,
  adminLogout,
  getAdminStats,
  getAdminArtists,
  getAdminArtistDetail,
  updateAdminArtistStatus,
  deleteAdminArtist,
} from "../controllers/adminController";

import { adminAuth } from "../middleware/adminAuthMiddleware";
import {
  adminGetInquiries,
  adminUpdateInquiryStatus,
  adminDeleteInquiry,
} from "../controllers/inquiryController";

const router = Router();

// ============================================================
// CEO AUTHENTICATION
// ============================================================

// CEO login
router.post("/login", adminLogin);

// Protected CEO profile
router.get("/me", adminAuth, getAdminProfile);

// CEO logout
router.post("/logout", adminLogout);

// ============================================================
// PROTECTED ADMIN DASHBOARD
// ============================================================

// Dashboard stats, analytics and recent activity
router.get("/stats", adminAuth, getAdminStats);

// ============================================================
// ARTIST MANAGEMENT
// ============================================================

// Get artists with pagination, search and status filter
router.get("/artists", adminAuth, getAdminArtists);

// Get a single artist
router.get("/artists/:id", adminAuth, getAdminArtistDetail);

// Approve, reject or verify an artist
router.put(
  "/artists/:id/status",
  adminAuth,
  updateAdminArtistStatus
);

// Delete an artist account
router.delete(
  "/artists/:id",
  adminAuth,
  deleteAdminArtist
);

// ============================================================
// INQUIRIES & CONTACT MANAGEMENT
// ============================================================
router.get("/inquiries", adminAuth, adminGetInquiries);
router.patch("/inquiries/:id/status", adminAuth, adminUpdateInquiryStatus);
router.delete("/inquiries/:id", adminAuth, adminDeleteInquiry);

export default router;
