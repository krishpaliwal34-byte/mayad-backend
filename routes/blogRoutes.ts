import { Router } from "express";
import {
  getAllBlogs,
  getBlogBySlug,
  getAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController";
import { adminAuth } from "../middleware/adminAuthMiddleware";

const router = Router();

// PUBLIC ROUTES
router.get("/", getAllBlogs);

// ADMIN ROUTES (Must be defined before /:slug)
router.get("/admin/all", adminAuth, getAdminBlogs);
router.post("/", adminAuth, createBlog);
router.put("/:id", adminAuth, updateBlog);
router.delete("/:id", adminAuth, deleteBlog);

// DYNAMIC SLUG ROUTE
router.get("/:slug", getBlogBySlug);

export default router;
