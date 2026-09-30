import { Request, Response } from "express";

import crypto from "crypto";

import jwt from "jsonwebtoken";

import Artist from "../models/Artist";

const ArtistModel: any = Artist;

import PublicArtist from "../models/PublicArtist";

import { ArtistAuthRequest } from "../middleware/artistAuthMiddleware";
import cloudinary from "../utils/cloudinary";
import { sendInvitationEmail } from "../utils/sendEmail";

// ============================================================

// HELPERS

// ============================================================

const generateArtistJwt = (artistId: string): string => {

  const secret = process.env.JWT_SECRET;

  if (!secret) {

    throw new Error("JWT_SECRET is not configured on server");

  }

  return jwt.sign(

    {

      userId: artistId,

      role: "artist",

    },

    secret,

    {

      expiresIn: "7d",

    }

  );

};

const getSafeString = (

  value: unknown

): string | undefined => {

  if (typeof value !== "string") {

    return undefined;

  }

  return value.trim();

};

const getArtistResponse = (artist: any) => {

  return {

    id: artist._id?.toString(),

    fullName: artist.fullName,

    stageName: artist.stageName,

    email: artist.email,

    phone: artist.phone,

    category: artist.category,

    secondaryCategory: artist.secondaryCategory,

    experience: artist.experience,

    location: artist.location,

    languages: artist.languages,

    bio: artist.bio,

    profilePhoto: artist.profilePhoto,

    showreel: artist.showreel,

    imdb: artist.imdb,

    instagram: artist.instagram,

    role: artist.role,

    isVerified: artist.isVerified,

    accountStatus: artist.accountStatus,

    createdAt: artist.createdAt,

    updatedAt: artist.updatedAt,

  };

};

// ============================================================
// 0. ARTIST REGISTRATION
// POST /api/artist/register
// ============================================================
export const artistRegister = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      fullName,
      email,
      mobile,
      phone,
      dob,
      gender,
      city,
      state,
      role,
      password,
    } = req.body;

    const nameVal = (fullName || name || "").trim();
    const emailVal = (email || "").toLowerCase().trim();
    const phoneVal = (mobile || phone || "").trim();
    const dobVal = (dob || "").trim();
    const genderVal = (gender || "").trim();
    const cityVal = (city || "").trim();
    const stateVal = (state || "").trim();
    const roleVal = (role || "").trim();

    if (
      !nameVal ||
      !emailVal ||
      !phoneVal ||
      !dobVal ||
      !genderVal ||
      !cityVal ||
      !stateVal ||
      !roleVal ||
      !password
    ) {
      res.status(400).json({
        success: false,
        message: "All required registration fields must be provided.",
      });
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(emailVal)) {
      res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
      return;
    }

    // Check if email exists
    const existingEmail = await ArtistModel.findOne({ email: emailVal });
    if (existingEmail) {
      res.status(400).json({
        success: false,
        message: "Artist account with this email already exists.",
      });
      return;
    }

    // Check if phone exists (if provided)
    if (phoneVal) {
      const existingPhone = await ArtistModel.findOne({ phone: phoneVal });
      if (existingPhone) {
        res.status(400).json({
          success: false,
          message: "Artist account with this mobile number already exists.",
        });
        return;
      }
    }

    const artist = await ArtistModel.create({
      fullName: nameVal,
      email: emailVal,
      phone: phoneVal,
      dob: dobVal,
      gender: genderVal,
      city: cityVal,
      state: stateVal,
      artistRole: roleVal,
      category: roleVal,
      location: `${cityVal}, ${stateVal}`,
      password,
      accountStatus: "Approved",
      isVerified: true,
    });

    const token = generateArtistJwt(artist._id.toString());

    res.cookie("artist_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "Artist account created successfully.",
      token,
      artist: getArtistResponse(artist),
    });
  } catch (error: any) {
    console.error("Artist Registration Error:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Server error during artist registration",
    });
  }
};

// ============================================================

// 1. ARTIST LOGIN

// POST /api/artist/login

// ============================================================

export const artistLogin = async (

  req: Request,

  res: Response

): Promise<void> => {

  try {

    const { email, password } = req.body;

    if (

      typeof email !== "string" ||

      typeof password !== "string" ||

      !email.trim() ||

      !password

    ) {

      res.status(400).json({

        success: false,

        message: "Email and password are required",

      });

      return;

    }

    const emailClean = email.toLowerCase().trim();

    const artist = await Artist.findOne({

      email: emailClean,

    }).select("+password");

    if (!artist) {

      res.status(401).json({

        success: false,

        message: "Invalid email address or password",

      });

      return;

    }

    const isMatch = await artist.comparePassword(password);

    if (!isMatch) {

      res.status(401).json({

        success: false,

        message: "Invalid email address or password",

      });

      return;

    }

    const token = generateArtistJwt(

      artist._id.toString()

    );

    res.cookie("artist_token", token, {

      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      maxAge: 7 * 24 * 60 * 60 * 1000,

    });

    res.status(200).json({

      success: true,

      message: "Login successful",

      token,

      artist: getArtistResponse(artist),

    });

  } catch (error) {

    console.error("Artist Login Error:", error);

    res.status(500).json({

      success: false,

      message: "Server error during artist login",

    });

  }

};

// ==========================================
// CHANGE TEMPORARY PASSWORD
// POST /api/artist/change-temporary-password
// ==========================================

export const changeTemporaryPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      changeToken,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      typeof changeToken !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    if (
      !changeToken ||
      !newPassword ||
      !confirmPassword
    ) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
      return;
    }

    let decoded: any;

    try {
      decoded = jwt.verify(changeToken, secret);
    } catch {
      res.status(401).json({
        success: false,
        message: "Invalid or expired password change token",
      });
      return;
    }

    if (
      decoded.role !== "artist" ||
      decoded.purpose !== "change-temporary-password" ||
      !decoded.userId
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid password change token",
      });
      return;
    }

    const artist = await Artist.findById(
      decoded.userId
    ).select("+password");

    if (!artist) {
      res.status(404).json({
        success: false,
        message: "Artist account not found",
      });
      return;
    }

    if (!artist.get("mustChangePassword")) {
      res.status(400).json({
        success: false,
        message: "Temporary password has already been changed",
      });
      return;
    }

    artist.password = newPassword;
    artist.set("mustChangePassword", false);

    await artist.save();

    const token = generateArtistJwt(
      artist._id.toString()
    );

    res.cookie("artist_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      token,
      artist: getArtistResponse(artist),
    });
  } catch (error) {
    console.error(
      "Change Temporary Password Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error changing password",
    });
  }
};

// ============================================================

// 2. GET CURRENT ARTIST PROFILE

// GET /api/artist/me

// ============================================================

export const getArtistMe = async (

  req: ArtistAuthRequest,

  res: Response

): Promise<void> => {

  try {

    if (!req.userId) {

      res.status(401).json({

        success: false,

        message: "Unauthorized",

      });

      return;

    }

    const artist = await Artist.findById(req.userId);

    if (!artist) {

      res.status(404).json({

        success: false,

        message: "Artist profile not found",

      });

      return;

    }

    let movies: any[] = [];
    try {
      const MovieRoleModel: any = require("../models/MovieRole").default;
      const assignedRoles = await MovieRoleModel.find({ artist: req.userId }).populate("movie");
      movies = assignedRoles.map((r: any) => {
        const m = r.movie || {};
        return {
          id: r._id?.toString(),
          roleId: r._id?.toString(),
          projectId: m._id?.toString(),
          title: m.title || "Project",
          poster: m.posterUrl || "/mayad.jpg",
          releaseYear: m.year || (m.releaseDate ? new Date(m.releaseDate).getFullYear() : undefined),
          role: r.roleName || r.characterName || "Assigned Role",
          characterName: r.characterName,
          roleType: r.roleType,
          roleStatus: r.roleStatus,
          language: m.language || "Rajasthani",
          description: m.description || "",
          imdb: m.slug ? `/movies/${m.slug}` : undefined,
        };
      });
    } catch (e) {
      console.error("Error fetching movies for artist profile:", e);
    }

    res.status(200).json({

      success: true,

      artist: {
        ...getArtistResponse(artist),
        movies,
      },

    });

  } catch (error) {

    console.error("Get Artist Profile Error:", error);

    res.status(500).json({

      success: false,

      message: "Server error retrieving artist profile",

    });

  }

};

// ============================================================

// 3. UPDATE ARTIST PROFILE

// PUT /api/artist/me

// ============================================================

export const updateArtistProfile = async (

  req: ArtistAuthRequest,

  res: Response

): Promise<void> => {

  try {

    if (!req.userId) {

      res.status(401).json({

        success: false,

        message: "Unauthorized",

      });

      return;

    }

    if (

      !req.body ||

      typeof req.body !== "object" ||

      Array.isArray(req.body)

    ) {

      res.status(400).json({

        success: false,

        message: "Invalid profile data",

      });

      return;

    }

    const artist = await Artist.findById(req.userId);

    if (!artist) {

      res.status(404).json({

        success: false,

        message: "Artist profile not found",

      });

      return;

    }

    const body = req.body;

    // Only allow approved profile fields to be updated.

    // Email, password, role, verification and account status

    // cannot be changed using this endpoint.

    if (body.fullName !== undefined) {

      const value = getSafeString(body.fullName);

      if (value !== undefined) artist.fullName = value;

    }

    if (body.stageName !== undefined) {

      const value = getSafeString(body.stageName);

      if (value !== undefined) artist.stageName = value;

    }

    if (body.phone !== undefined) {

      const value = getSafeString(body.phone);

      if (value !== undefined) artist.phone = value;

    }

    if (body.category !== undefined) {

      const value = getSafeString(body.category);

      if (value !== undefined) artist.category = value;

    }

    if (body.secondaryCategory !== undefined) {

      const value = getSafeString(

        body.secondaryCategory

      );

      if (value !== undefined) {

        artist.set("secondaryCategory", value);

      }

    }

    if (body.experience !== undefined) {

      const value = getSafeString(body.experience);

      if (value !== undefined) artist.experience = value;

    }

    if (body.location !== undefined) {

      const value = getSafeString(body.location);

      if (value !== undefined) artist.location = value;

    }

    if (body.languages !== undefined) {

      if (Array.isArray(body.languages)) {

        artist.languages = body.languages.filter(

          (language: unknown): language is string =>

            typeof language === "string"

        );

      } else if (typeof body.languages === "string") {

        artist.languages = body.languages

          .split(",")

          .map((language: string) => language.trim())

          .filter(Boolean);

      }

    }

    if (body.bio !== undefined) {

      const value = getSafeString(body.bio);

      if (value !== undefined) artist.bio = value;

    }

    if (body.profilePhoto !== undefined) {

      const value = getSafeString(body.profilePhoto);

      if (value !== undefined) artist.profilePhoto = value;

    }

    if (body.showreel !== undefined) {

      const value = getSafeString(body.showreel);

      if (value !== undefined) artist.showreel = value;

    }

    if (body.imdb !== undefined) {

      const value = getSafeString(body.imdb);

      if (value !== undefined) artist.imdb = value;

    }

    if (body.instagram !== undefined) {

      const value = getSafeString(body.instagram);

      if (value !== undefined) artist.instagram = value;

    }

    await artist.save();

    res.status(200).json({

      success: true,

      message: "Artist profile updated successfully",

      artist: getArtistResponse(artist),

    });

  } catch (error: any) {

    console.error("Update Artist Profile Error:", error);

    if (error.code === 11000) {

      res.status(400).json({

        success: false,

        message:

          "This phone number is already registered with another account.",

      });

      return;

    }

    if (error.name === "ValidationError") {

      res.status(400).json({

        success: false,

        message: error.message,

      });

      return;

    }

    if (error.name === "CastError") {

      res.status(400).json({

        success: false,

        message: `Invalid value for field: ${error.path}`,

      });

      return;

    }

    res.status(500).json({

      success: false,

      message: "Server error updating artist profile",

    });

  }

};

// ============================================================

// 4. ARTIST LOGOUT

// POST /api/artist/logout

// ============================================================

export const artistLogout = async (

  _req: Request,

  res: Response

): Promise<void> => {

  res.clearCookie("artist_token", {

    httpOnly: true,

    sameSite: "lax",

    secure: process.env.NODE_ENV === "production",

  });

  res.status(200).json({

    success: true,

    message: "Logged out successfully",

  });

};

// ============================================================

// 5. REQUEST PASSWORD RESET

// POST /api/artist/forgot-password

// ============================================================

export const requestPasswordReset = async (

  req: Request,

  res: Response

): Promise<void> => {

  try {

    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {

      res.status(400).json({

        success: false,

        message: "Email address is required",

      });

      return;

    }

    const emailClean = email.toLowerCase().trim();

    const artist = await Artist.findOne({

      email: emailClean,

    });

    const genericResponse = {

      success: true,

      message:

        "If an artist account exists with this email address, password reset instructions have been sent.",

    };

    if (!artist) {

      res.status(200).json(genericResponse);

      return;

    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto

      .createHash("sha256")

      .update(rawToken)

      .digest("hex");

    const expiresAt = new Date(

      Date.now() + 60 * 60 * 1000

    );

    artist.resetPasswordTokenHash = tokenHash;

    artist.resetPasswordExpiresAt = expiresAt;

    await artist.save();

    const frontendUrl =

      process.env.FRONTEND_URL || "http\://localhost:3000";

    const resetLink =

      `${frontendUrl}/artist/reset-password?token=${rawToken}`;

    const emailResult = await sendInvitationEmail({

      toEmail: artist.email,

      artistName: artist.fullName,

      inviteLink: resetLink,

    });

    res.status(200).json({

      ...genericResponse,

      resetLink: emailResult.sent ? undefined : resetLink,

    });

  } catch (error) {

    console.error("Request Password Reset Error:", error);

    res.status(500).json({

      success: false,

      message: "Server error requesting password reset",

    });

  }

};

// ============================================================

// 6. RESET PASSWORD WITH TOKEN

// POST /api/artist/reset-password

// ============================================================

export const resetPassword = async (

  req: Request,

  res: Response

): Promise<void> => {

  try {

    const {

      token,

      newPassword,

      confirmPassword,

    } = req.body;

    if (

      typeof token !== "string" ||

      typeof newPassword !== "string" ||

      typeof confirmPassword !== "string" ||

      !token ||

      !newPassword ||

      !confirmPassword

    ) {

      res.status(400).json({

        success: false,

        message:

          "Reset token, new password, and confirm password are required",

      });

      return;

    }

    if (newPassword !== confirmPassword) {

      res.status(400).json({

        success: false,

        message: "Passwords do not match",

      });

      return;

    }

    if (newPassword.length < 6) {

      res.status(400).json({

        success: false,

        message: "Password must be at least 6 characters",

      });

      return;

    }

    const tokenHash = crypto

      .createHash("sha256")

      .update(token)

      .digest("hex");

    const artist = await Artist.findOne({

      resetPasswordTokenHash: tokenHash,

      resetPasswordExpiresAt: {

        $gt: new Date(),

      },

    }).select(

      "+password +resetPasswordTokenHash +resetPasswordExpiresAt"

    );

    if (!artist) {

      res.status(400).json({

        success: false,

        message:

          "Invalid or expired password reset token. Please request a new reset link.",

      });

      return;

    }

    // Artist model's pre-save hook hashes the password.

    artist.password = newPassword;

    artist.resetPasswordTokenHash = undefined;

    artist.resetPasswordExpiresAt = undefined;

    await artist.save();

    res.status(200).json({

      success: true,

      message:

        "Password reset successfully! You can now sign in with your new password.",

    });

  } catch (error) {

    console.error("Reset Password Error:", error);

    res.status(500).json({

      success: false,

      message: "Server error resetting password",

    });

  }

};

// ============================================================

// 7. GET PUBLIC ARTISTS

// GET /api/artist

// ============================================================

export const getPublicArtists = async (

  _req: Request,

  res: Response

): Promise<void> => {

  try {

    // Fetch approved and verified registered artists

    const registeredArtists = await Artist.find({

      accountStatus: "Approved",

      isVerified: true,

    })

      .select(

        "fullName stageName category secondaryCategory experience location languages bio profilePhoto showreel imdb instagram isVerified createdAt"

      )

      .sort({ createdAt: -1 })

      .lean();

    // Fetch all legacy artists from publicartists collection

    const legacyArtists = await PublicArtist.find()

      .sort({ createdAt: -1 })

      .lean();

    // Convert legacy data into the frontend-compatible format

    const legacyData = legacyArtists.map((artist: any) => ({

      id: artist.legacyId || artist._id.toString(),

      slug: artist.slug || artist.legacyId,

      name: artist.name || artist.originalName || "Artist",

      fullName: artist.name || artist.originalName || "Artist",

      originalName: artist.originalName || artist.name,

      role: artist.role || "Artist",

      category: artist.role || "Artist",

      secondaryCategory: "",

      experience: "",

      imageUrl: artist.imageUrl || "/Default.jpg",

      profilePhoto: artist.imageUrl || "/Default.jpg",

      bio: artist.bio || "",

      dob: artist.dob,

      birthPlace: artist.birthPlace,

      highlights: artist.highlights || [],

      tag: artist.tag || "STAR",

      location: artist.birthPlace || "",

      languages: [],

      showreel: "",

      imdb: "",

      instagram: "",

      isVerified: true,

      createdAt: artist.createdAt,

    }));

    // Convert registered accounts into the same format

    const registeredData = registeredArtists.map(

      (artist: any) => {

        const name =

          artist.stageName ||

          artist.fullName ||

          "Artist";

        const slug = name

          .toLowerCase()

          .trim()

          .replace(/\s+/g, "-");

        return {

          id: artist._id.toString(),

          slug,

          name,

          fullName: artist.fullName,

          originalName: artist.fullName,

          role: artist.category || "Artist",

          category: artist.category || "Artist",

          secondaryCategory:

            artist.secondaryCategory || "",

          experience: artist.experience || "",

          imageUrl:

            artist.profilePhoto || "/mayad.jpg",

          profilePhoto:

            artist.profilePhoto || "/mayad.jpg",

          bio: artist.bio || "",

          highlights: [

            artist.category,

            artist.secondaryCategory,

          ].filter(Boolean),

          tag: "STAR",

          location: artist.location || "",

          languages: artist.languages || [],

          showreel: artist.showreel || "",

          imdb: artist.imdb || "",

          instagram: artist.instagram || "",

          isVerified: artist.isVerified,

          createdAt: artist.createdAt,

        };

      }

    );

    // Combine both MongoDB collections.

    // Legacy records are placed first so their original

    // static profile content is preserved.

    const combinedArtists = [

      ...legacyData,

      ...registeredData,

    ];

    // Remove duplicates by normalized artist name

    const uniqueArtists = new Map<string, any>();

    for (const artist of combinedArtists) {

      const key = (

        artist.name ||

        artist.fullName ||

        artist.id

      )

        .toLowerCase()

        .trim()

        .replace(/\s+/g, " ");

      if (!uniqueArtists.has(key)) {

        uniqueArtists.set(key, artist);

      } else {

        const existing = uniqueArtists.get(key);

        uniqueArtists.set(key, {

          ...artist,

          ...existing,

          name: existing.name || artist.name,

          fullName:

            existing.fullName || artist.fullName,

          imageUrl:

            existing.imageUrl || artist.imageUrl,

          profilePhoto:

            existing.profilePhoto ||

            artist.profilePhoto,

          bio: existing.bio || artist.bio,

          highlights:

            existing.highlights?.length

              ? existing.highlights

              : artist.highlights,

          isVerified:

            existing.isVerified ||

            artist.isVerified,

        });

      }

    }

    const finalArtists = Array.from(

      uniqueArtists.values()

    );

    res.status(200).json({

      success: true,

      count: finalArtists.length,

      artists: finalArtists,

    });

  } catch (error) {

    console.error("Get Public Artists Error:", error);

    res.status(500).json({

      success: false,

      message: "Server error retrieving artists",

    });

  }

};
// ==========================================
// UPLOAD ARTIST PROFILE PHOTO
// POST /api/artist/upload-profile-photo
// ==========================================

export const uploadArtistProfilePhoto = async (
  req: ArtistAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const artistId = req.userId;

    if (!artistId) {
      res.status(401).json({
        success: false,
        message: "Please login first",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Please select an image",
      });
      return;
    }

    const artist = await Artist.findById(artistId);

    if (!artist) {
      res.status(404).json({
        success: false,
        message: "Artist account not found",
      });
      return;
    }

    let photoUrl = "";

    const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim().replace(/^["']|["']$/g, "");
    const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim().replace(/^["']|["']$/g, "");
    const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim().replace(/^["']|["']$/g, "");

    if (cloudName && apiKey && apiSecret) {
      try {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
          secure: true,
        });

        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "mayad/artists",
              public_id: `artist_${artistId}_${Date.now()}`,
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file!.buffer);
        });

        if (uploadResult && uploadResult.secure_url) {
          photoUrl = uploadResult.secure_url;
        }
      } catch (cloudErr: any) {
        console.warn("Cloudinary Upload Error (falling back to Data URL):", cloudErr?.message || cloudErr);
      }
    }

    // Automatic fallback if Cloudinary returns 403 Forbidden or fails
    if (!photoUrl && req.file) {
      const mime = req.file.mimetype || "image/jpeg";
      const base64 = req.file.buffer.toString("base64");
      photoUrl = `data:${mime};base64,${base64}`;
    }

    if (!photoUrl) {
      res.status(400).json({
        success: false,
        message: "Failed to process image file",
      });
      return;
    }

    // Save Cloudinary URL or Data URL in artist's MongoDB document
    artist.profilePhoto = photoUrl;

    await artist.save();

    res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      profilePhoto: photoUrl,
      artist: getArtistResponse(artist),
    });
  } catch (error: any) {
    console.error("Profile Photo Upload Error:", error);

    res.status(500).json({
      success: false,
      message: error?.message || "Failed to upload profile photo",
    });
  }
};