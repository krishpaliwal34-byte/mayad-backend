
import { Request, Response } from "express";
import Movie from "../models/Movie";

// Workaround for strict Mongoose query typings
const MovieModel: any = Movie;

// ============================================================
// PUBLIC: GET ALL PUBLISHED MOVIES
// GET /api/movies
// ============================================================

export const getAllMovies = async (req: Request, res: Response) => {
  try {
    const movies = await MovieModel.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error("Get all movies error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch movies",
    });
  }
};

// ============================================================
// PUBLIC: GET TOP 5 MOVIES
// GET /api/movies/top5
// ============================================================

export const getTop5Movies = async (req: Request, res: Response) => {
  try {
    const movies = await MovieModel.find({
      isPublished: true,
      isTop5: true,
      type: "movie",
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error("Get top 5 movies error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch top 5 movies",
    });
  }
};

// ============================================================
// PUBLIC: GET TRENDING MOVIES
// GET /api/movies/trending
// ============================================================

export const getTrendingMovies = async (req: Request, res: Response) => {
  try {
    const movies = await MovieModel.find({
      isPublished: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error("Get trending movies error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch trending movies",
    });
  }
};

// ============================================================
// PUBLIC: GET MOST LIKED MOVIES
// GET /api/movies/most-liked
// ============================================================

export const getMostLikedMovies = async (
  req: Request,
  res: Response
) => {
  try {
    const movies = await MovieModel.find({
      isPublished: true,
      type: "movie",
    })
      .sort({ likes: -1, createdAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error("Get most liked movies error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch most liked movies",
    });
  }
};

// ============================================================
// PUBLIC: GET MAYAD ORIGINALS
// GET /api/movies/originals
// ============================================================

export const getMayadOriginals = async (
  req: Request,
  res: Response
) => {
  try {
    const movies = await MovieModel.find({
      isPublished: true,
      isOriginal: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error("Get MAYAD Originals error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch MAYAD Originals",
    });
  }
};

// ============================================================
// PUBLIC: GET TV SHOWS
// GET /api/movies/series
// ============================================================

export const getSeries = async (req: Request, res: Response) => {
  try {
    const series = await MovieModel.find({
      isPublished: true,
      type: "series",
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: series.length,
      movies: series,
    });
  } catch (error) {
    console.error("Get TV shows error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch TV shows",
    });
  }
};

// ============================================================
// PUBLIC: GET SINGLE MOVIE BY SLUG
// GET /api/movies/:slug
// ============================================================

export const getMovieBySlug = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug || "").toLowerCase();

    const movie = await MovieModel.findOne({
      slug,
      isPublished: true,
    }).lean();

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    console.error("Get movie by slug error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch movie",
    });
  }
};

// ============================================================
// ADMIN: GET ALL MOVIES INCLUDING UNPUBLISHED
// GET /api/movies/admin/all
// ============================================================

export const getAdminMovies = async (req: Request, res: Response) => {
  try {
    const movies = await MovieModel.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.error("Get admin movies error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin movies",
    });
  }
};

// ============================================================
// ADMIN: ADD MOVIE OR SERIES
// POST /api/movies/admin
// ============================================================

export const createMovie = async (req: Request, res: Response) => {
  try {
    const {
      slug,
      title,
      originalTitle,
      posterUrl,
      backdropUrl,
      movieUrl,
      videoUrl,
      url,
      type,
      category,
      language,
      year,
      duration,
      genre,
      genres,
      description,
      cast,
      director,
      productionHouse,
      releaseDate,
      shootingStartDate,
      shootingEndDate,
      shootingLocations,
      projectStatus,
      isOriginal,
      isTrending,
      isTop5,
      isPublished,
      likes,
    } = req.body;

    if (!slug || !title || !posterUrl) {
      return res.status(400).json({
        success: false,
        message: "Slug, title and posterUrl are required",
      });
    }

    const normalizedSlug = String(slug)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const existingMovie = await MovieModel.findOne({
      slug: normalizedSlug,
    });

    if (existingMovie) {
      return res.status(409).json({
        success: false,
        message: "A movie with this slug already exists",
      });
    }

    const movie = await MovieModel.create({
      slug: normalizedSlug,
      title,
      originalTitle,
      posterUrl,
      backdropUrl,
      movieUrl: String(movieUrl || videoUrl || url || "").trim(),
      videoUrl: String(videoUrl || movieUrl || url || "").trim(),
      type: type || "movie",
      category,
      language,
      year,
      duration,
      genre,
      genres,
      description,
      cast,
      director,
      productionHouse: String(productionHouse || "").trim(),
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      shootingStartDate: shootingStartDate ? new Date(shootingStartDate) : undefined,
      shootingEndDate: shootingEndDate ? new Date(shootingEndDate) : undefined,
      shootingLocations: Array.isArray(shootingLocations) ? shootingLocations : [],
      projectStatus: projectStatus || "Published",
      isOriginal: false,
      isTrending: isTrending !== undefined ? Boolean(isTrending) : true,
      isTop5: false,
      isPublished:
        isPublished !== undefined
          ? Boolean(isPublished)
          : true,
      likes: Number(likes) || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Movie added successfully",
      movie,
    });
  } catch (error) {
    console.error("Create movie error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add movie",
    });
  }
};

// ============================================================
// ADMIN: UPDATE MOVIE
// PUT /api/movies/admin/:id
// ============================================================

export const updateMovie = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || "");

    const movie = await MovieModel.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    const allowedFields = [
      "slug",
      "title",
      "originalTitle",
      "posterUrl",
      "backdropUrl",
      "movieUrl",
      "videoUrl",
      "url",
      "type",
      "category",
      "language",
      "year",
      "duration",
      "genre",
      "genres",
      "description",
      "cast",
      "director",
      "productionHouse",
      "releaseDate",
      "shootingStartDate",
      "shootingEndDate",
      "shootingLocations",
      "projectStatus",
      "isOriginal",
      "isTrending",
      "isTop5",
      "isPublished",
      "likes",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        movie[field] = req.body[field];
      }
    }

    if (req.body.slug !== undefined) {
      movie.slug = String(req.body.slug)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
    }

    await movie.save();

    return res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      movie,
    });
  } catch (error) {
    console.error("Update movie error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update movie",
    });
  }
};

// ============================================================
// ADMIN: DELETE MOVIE
// DELETE /api/movies/admin/:id
// ============================================================

export const deleteMovie = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || "");

    const movie = await MovieModel.findByIdAndDelete(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (error) {
    console.error("Delete movie error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete movie",
    });
  }
};
