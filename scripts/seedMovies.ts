
import dotenv from "dotenv";
import mongoose from "mongoose";
import Movie from "../models/Movie";

dotenv.config();

// Fix Mongoose TypeScript overload issue
const MovieModel: any = Movie;

// ============================================================
// MAYAD MOVIES + TV SHOWS
// 6 Movies + 4 TV Shows
// ============================================================

const movies = [
  // ==================== MOVIES ====================

  {
    slug: "vadlya-hindva",
    title: "Vadlya Hindva",
    originalTitle: "वडल्या हिंडवा",
    posterUrl: "/vadliyahindva.jpg",
    backdropUrl: "/vadliyahindva.jpg",
    type: "movie",
    language: "Rajasthani",
    year: 2026,
    duration: "2h 15m",
    genre: "historical | thriller | devotional",
    genres: ["historical", "thriller", "devotional"],
    description:
      "An epic tale of duty, honor, and ancestral heritage rooted deep within the golden sands of Rajasthan.",
    cast: ["Tara Shree"],
    director: "MAYAD Original Team",
    isOriginal: true,
    isTrending: true,
    isTop5: true,
    isPublished: true,
    likes: 0,
  },

  {
    slug: "seth-maharo-sanwariya",
    title: "Seth Maharo Sanwariya",
    originalTitle: "सेठ म्हारो सांवरिया",
    posterUrl: "/sawariyaseth1.jpg",
    backdropUrl: "/sawariyaseth1.jpg",
    type: "movie",
    language: "Rajasthani",
    year: 2026,
    duration: "1h 50m",
    genre: "devotional",
    genres: ["devotional"],
    description:
      "A soulful Rajasthani cinematic experience filled with devotion, emotion, music and timeless storytelling.",
    cast: [
      "Abhi Soni",
      "Garvakarnika Rathore",
      "Kailash Mewadi",
      "Ramesh Nagda",
    ],
    director: "DP Singh Basni",
    isOriginal: true,
    isTrending: true,
    isTop5: true,
    isPublished: true,
    likes: 0,
  },

  {
    slug: "maa-padmavati",
    title: "Maa Padmavati",
    originalTitle: "माँ पद्मावती",
    posterUrl: "/Padmavati.jpg",
    backdropUrl: "/Padmavati.jpg",
    type: "movie",
    language: "Rajasthani",
    year: 2026,
    duration: "1h 40m",
    genre: "Historical",
    genres: ["historical"],
    description:
      "A historic saga inspired by the courage, honor and glorious heritage of Rajasthan.",
    cast: ["Tara Shree"],
    director: "MAYAD Original Team",
    isOriginal: true,
    isTrending: true,
    isTop5: true,
    isPublished: true,
    likes: 0,
  },

  {
    slug: "sawariya",
    title: "Sawariya Seth",
    originalTitle: "सांवरिया",
    posterUrl: "/sawariyaseth2.jpg",
    backdropUrl: "/sawariyaseth2.jpg",
    type: "movie",
    language: "Rajasthani",
    year: 2026,
    duration: "2h",
    genre: "devotional",
    genres: ["devotional"],
    description:
      "A soulful Rajasthani story filled with love, devotion, emotion and beautiful music.",
    cast: [
      "Abhi Soni",
      "Anjli",
      "Garvakarnika Rathore",
      "Kailash Mewadi",
      "Ramesh Nagda",
    ],
    director: "MAYAD Original Team",
    isOriginal: true,
    isTrending: true,
    isTop5: true,
    isPublished: true,
    likes: 0,
  },

  {
    slug: "dadalaadladaya",
    title: "Dada Laad Ladaya",
    originalTitle: "",
    posterUrl: "/DadaLaad.jpg",
    backdropUrl: "/DadaLaad.jpg",
    type: "movie",
    language: "Rajasthani",
    year: 2026,
    duration: "2h",
    genre: "devotional",
    genres: ["devotional"],
    description:
      "A soulful Rajasthani story filled with love, devotion, emotion and beautiful music.",
    cast: ["Abhi Soni", "Ramesh Nagda"],
    director: "MAYAD Original Team",
    isOriginal: true,
    isTrending: true,
    isTop5: true,
    isPublished: true,
    likes: 0,
  },

  {
    slug: "sethmaharosanwariya",
    title: "Seth Maharo Sanwariya",
    originalTitle: "सेठ म्हारो सांवरिया",
    posterUrl: "/sawariya.jpg",
    backdropUrl: "/sawariya.jpg",
    type: "movie",
    language: "Rajasthani",
    year: 2026,
    duration: "2h",
    genre: "devotional",
    genres: ["devotional"],
    description:
      "A soulful Rajasthani story filled with love, devotion, emotion and beautiful music.",
    cast: ["Abhi Soni", "Kailash Mewadi"],
    director: "MAYAD Original Team",
    isOriginal: true,
    isTrending: true,
    isTop5: false,
    isPublished: true,
    likes: 0,
  },

  // ==================== TV SHOWS ====================

  {
    slug: "rajasthan-diaries",
    title: "Rajasthan Diaries",
    originalTitle: "राजस्थान डायरीज़",
    posterUrl: "/Hero/vadliyahindva.jpg",
    backdropUrl: "/Hero/vadliyahindva.jpg",
    type: "series",
    language: "Rajasthani",
    year: 2026,
    duration: "Season 1",
    genre: "Drama",
    genres: [],
    description:
      "Stories, people and traditions from the heart of Rajasthan.",
    cast: ["MAYAD Artists", "Rajasthani Performers"],
    director: "MAYAD Original Team",
    isOriginal: true,
    isTrending: true,
    isTop5: false,
    isPublished: true,
    likes: 0,
  },

  {
    slug: "rangilo-rajasthan",
    title: "Rangilo Rajasthan",
    originalTitle: "रंगीला राजस्थान",
    posterUrl: "/Hero/sawariyaseth1.jpg",
    backdropUrl: "/Hero/sawariyaseth1.jpg",
    type: "series",
    language: "Rajasthani",
    year: 2026,
    duration: "Season 1",
    genre: "Culture",
    genres: [],
    description:
      "Discover the colours, music, traditions and stories of Rajasthan.",
    cast: ["MAYAD Artists", "Rajasthani Artists"],
    director: "MAYAD Original Team",
    isOriginal: true,
    isTrending: false,
    isTop5: false,
    isPublished: true,
    likes: 0,
  },

  {
    slug: "dharti-rajasthan-ki",
    title: "Dharti Rajasthan Ki",
    originalTitle: "धरती राजस्थान की",
    posterUrl: "/Hero/Padmavati.jpg",
    backdropUrl: "/Hero/Padmavati.jpg",
    type: "series",
    language: "Rajasthani",
    year: 2026,
    duration: "Season 1",
    genre: "Documentary",
    genres: [],
    description:
      "A journey through the heritage, history and cultural identity of Rajasthan.",
    cast: ["MAYAD Original Artists"],
    director: "MAYAD Original Team",
    isOriginal: true,
    isTrending: false,
    isTop5: false,
    isPublished: true,
    likes: 0,
  },

  {
    slug: "mayad-folk",
    title: "MAYAD Folk",
    originalTitle: "मायड़ लोक",
    posterUrl: "/Hero/sawariyaseth2.jpg",
    backdropUrl: "/Hero/sawariyaseth2.jpg",
    type: "series",
    language: "Rajasthani",
    year: 2026,
    duration: "Season 1",
    genre: "Music",
    genres: [],
    description:
      "Traditional Rajasthani folk music, artists and unforgettable performances.",
    cast: ["Rajasthani Folk Artists"],
    director: "MAYAD Original Team",
    isOriginal: true,
    isTrending: false,
    isTop5: false,
    isPublished: true,
    likes: 0,
  },
];

// ============================================================
// SEED DATABASE
// Safe to run multiple times using slug
// ============================================================

const seedMovies = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI missing in Backend/.env");
    }

    await mongoose.connect(mongoUri);

    console.log("MongoDB connected successfully!");

    for (const movie of movies) {
      await MovieModel.findOneAndUpdate(
        { slug: movie.slug },
        { $set: movie },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`Seeded: ${movie.title} | ${movie.slug}`);
    }

    console.log("--------------------------------");
    console.log("MOVIE SEEDING COMPLETED!");
    console.log("Total records: 10");
    console.log("Movies: 6");
    console.log("TV Shows: 4");
    console.log("--------------------------------");
  } catch (error) {
    console.error("Movie seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

seedMovies();
