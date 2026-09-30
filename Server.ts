
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import connectDB from './config/db';

import watchlistRoutes from './routes/watchlistRoutes';
import artistRoutes from './routes/artistRoutes';
import adminRoutes from './routes/adminRoutes';
import movieRoutes from "./routes/movieRoutes";
import artistMediaRoutes from "./routes/artistMediaRoutes";
import inquiryRoutes from "./routes/inquiryRoutes";
import jobRoutes from "./routes/jobRoutes";

dotenv.config();

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS configuration for Next.js frontend
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies for admin authentication
app.use(cookieParser());

// ============================================================
// DATABASE CONNECTION
// ============================================================

connectDB();

// ============================================================
// WATCHLIST ROUTES
// ============================================================

app.use('/api/watchlist', watchlistRoutes);

// ============================================================
// ARTIST PORTAL ROUTES
// ============================================================

app.use('/api/artist', artistRoutes);

// ============================================================
// ADMIN PORTAL ROUTES
// ============================================================

app.use('/api/admin', adminRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/artist-media", artistMediaRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/jobs", jobRoutes);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'MAYAD Backend is running 🚀',
  });
});

// ============================================================
// SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 MAYAD Backend running on http://localhost:${PORT}`
  );
});
