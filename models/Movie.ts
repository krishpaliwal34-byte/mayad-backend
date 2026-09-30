
import mongoose, { Document, Schema } from "mongoose";

export interface IMovie extends Document {
  slug: string;
  title: string;
  originalTitle?: string;

  posterUrl: string;
  backdropUrl?: string;
  movieUrl?: string;
  videoUrl?: string;

  type: "movie" | "series";
  category?: string;
  language?: string;

  year?: number;
  duration?: string;
  genre?: string;
  genres: string[];

  description?: string;
  cast: string[];
  director?: string;
  productionHouse?: string;

  releaseDate?: Date;
  shootingStartDate?: Date;
  shootingEndDate?: Date;
  shootingLocations?: string[];
  projectStatus?: "Draft" | "Published" | "Archived" | "Cancelled";

  isOriginal: boolean;
  isTrending: boolean;
  isTop5: boolean;
  isPublished: boolean;

  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const MovieSchema = new Schema<IMovie>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    originalTitle: {
      type: String,
      default: "",
    },

    posterUrl: {
      type: String,
      required: true,
    },

    backdropUrl: {
      type: String,
      default: "",
    },

    movieUrl: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: ["movie", "series"],
      default: "movie",
    },

    category: {
      type: String,
      default: "",
    },

    language: {
      type: String,
      default: "Rajasthani",
    },

    year: {
      type: Number,
    },

    duration: {
      type: String,
      default: "",
    },

    genre: {
      type: String,
      default: "",
    },

    genres: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      default: "",
    },

    cast: {
      type: [String],
      default: [],
    },

    director: {
      type: String,
      default: "",
    },

    productionHouse: {
      type: String,
      default: "",
    },

    releaseDate: {
      type: Date,
    },

    shootingStartDate: {
      type: Date,
    },

    shootingEndDate: {
      type: Date,
    },

    shootingLocations: {
      type: [String],
      default: [],
    },

    projectStatus: {
      type: String,
      enum: ["Draft", "Published", "Archived", "Cancelled"],
      default: "Published",
    },

    isOriginal: {
      type: Boolean,
      default: false,
    },

    isTrending: {
      type: Boolean,
      default: false,
    },

    isTop5: {
      type: Boolean,
      default: false,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Movie =
  mongoose.models.Movie ||
  mongoose.model<IMovie>("Movie", MovieSchema);

export default Movie;
