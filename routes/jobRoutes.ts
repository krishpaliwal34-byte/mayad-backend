import express from 'express';
import { adminAuth } from '../middleware/adminAuthMiddleware';
import {
  getPublicJobs,
  getPublicJobById,
  applyForJob,
  getAdminJobs,
  createJob,
  updateJob,
  toggleJobStatus,
  deleteJob,
  getAdminApplications,
  updateApplicationStatus,
  deleteApplication,
  getCareerStats,
} from '../controllers/jobController';

const router = express.Router();

// ============================================================
// PUBLIC ROUTES
// ============================================================
router.get('/', getPublicJobs);
router.get('/detail/:id', getPublicJobById);
router.post('/:id/apply', applyForJob);

// ============================================================
// ADMIN ROUTES (Protected by adminAuth)
// ============================================================
router.get('/admin/all', adminAuth, getAdminJobs);
router.get('/admin/stats', adminAuth, getCareerStats);
router.post('/admin/create', adminAuth, createJob);
router.put('/admin/:id', adminAuth, updateJob);
router.patch('/admin/:id/status', adminAuth, toggleJobStatus);
router.delete('/admin/:id', adminAuth, deleteJob);

// Admin Application Management
router.get('/admin/applications', adminAuth, getAdminApplications);
router.patch('/admin/applications/:id/status', adminAuth, updateApplicationStatus);
router.delete('/admin/applications/:id', adminAuth, deleteApplication);

export default router;
