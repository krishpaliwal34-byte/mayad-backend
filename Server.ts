import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import connectDB from './config/db';

import watchlistRoutes from './routes/watchlistRoutes';
import artistRoutes from './routes/artistRoutes';
import adminRoutes from './routes/adminRoutes';
import movieRoutes from './routes/movieRoutes';
import artistMediaRoutes from './routes/artistMediaRoutes';
import inquiryRoutes from './routes/inquiryRoutes';
import jobRoutes from './routes/jobRoutes';

dotenv.config();

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

const allowedOrigins = [
  'http://localhost:3000',
   'https://mayad-q223.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ============================================================
// DATABASE
// ============================================================

connectDB();

// ============================================================
// ROUTES
// ============================================================

app.use('/api/watchlist', watchlistRoutes);
app.use('/api/artist', artistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/artist-media', artistMediaRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/jobs', jobRoutes);

// ============================================================
// ROOT
// ============================================================

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'MAYAD Backend is running 🚀',
  });
});

// ============================================================
// VERCEL / LOCAL SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 MAYAD Backend running on http://localhost:${PORT}`);
  });
}

export default app;