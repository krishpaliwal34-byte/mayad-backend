import express, { Router } from "express";
import multer from "multer";
import { submitTalentApplication } from "../controllers/talentController";

const router: Router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for image/pdf
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG, PNG, WEBP) and PDF files are allowed"));
    }
  },
});

router.post(
  "/register",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "synopsisPdf", maxCount: 1 },
  ]),
  submitTalentApplication
);

export default router;
