import { Router } from "express";
import { createInquiry } from "../controllers/inquiryController";

const router = Router();

// Public contact inquiry submission
router.post("/", createInquiry);

export default router;
