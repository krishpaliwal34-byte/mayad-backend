
import { Request, Response } from "express";
import crypto from "crypto";

import Artist from "../models/Artist";
import { sendArtistCredentialsEmail } from "../utils/sendEmail";

// ------------------------------------------------------------
// ADMIN: CREATE ARTIST ACCOUNT AND SEND LOGIN CREDENTIALS
// POST /api/admin/artists/invite
// ------------------------------------------------------------

export const inviteArtist = async (
  req: Request,
  res: Response
): Promise<void> => {
  let createdArtistId: unknown = null;

  try {
    const { artistName, email } = req.body;

    if (!artistName || !email) {
      res.status(400).json({
        success: false,
        message: "Artist name and email are required.",
      });
      return;
    }

    const cleanName = String(artistName).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      res.status(400).json({
        success: false,
        message: "Please enter a valid artist name and email.",
      });
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      res.status(500).json({
        success: false,
        message: "FRONTEND_URL is not configured in the backend .env file.",
      });
      return;
    }

    // Check whether an account already exists
    const existingArtist = await Artist.findOne({
      email: cleanEmail,
    });

    if (existingArtist) {
      res.status(409).json({
        success: false,
        message: "An artist account already exists with this email.",
      });
      return;
    }

    // Generate a secure temporary password
    const temporaryPassword = crypto
      .randomBytes(12)
      .toString("base64url");

    // Create artist account.
    // The Artist model pre-save hook hashes the password.
    const artist = new Artist({
      fullName: cleanName,
      email: cleanEmail,
      password: temporaryPassword,

      // Artist can complete these details after logging in.
      phone: undefined,
      category: "",
      secondaryCategory: "",
      experience: "",
      location: "",
      languages: [],
      bio: "",
      stageName: "",
      profilePhoto: "",
      showreel: "",
      imdb: "",
      instagram: "",

      role: "artist",
      isVerified: false,
      accountStatus: "Pending Approval",

      // Force password change at first login
      mustChangePassword: true,
    });

    await artist.save();

    createdArtistId = artist._id;

    const loginLink =
      `${frontendUrl.replace(/\/+$/, "")}/artist/login`;

    // Send login credentials to the artist
    await sendArtistCredentialsEmail({
      toEmail: cleanEmail,
      artistName: cleanName,
      temporaryPassword,
      loginLink,
    });

    res.status(201).json({
      success: true,
      message: `Artist account created and login credentials sent to ${cleanEmail}.`,
      artist: {
        id: artist._id,
        fullName: artist.fullName,
        email: artist.email,
        accountStatus: artist.accountStatus,
        mustChangePassword: artist.mustChangePassword,
      },
    });
  } catch (error: any) {
    console.error("Create artist account error:", error);

    // Roll back the account if email delivery failed.
    // Never return or log the temporary password.
    if (createdArtistId) {
      try {
        await Artist.findByIdAndDelete(createdArtistId);
      } catch (rollbackError) {
        console.error(
          "Could not roll back artist account:",
          rollbackError
        );
      }
    }

    if (error?.code === 11000) {
      res.status(409).json({
        success: false,
        message: "An artist account already exists with this email or phone.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message:
        "Could not create the artist account or send the login email. Please check the backend SMTP configuration.",
    });
  }
};

// ------------------------------------------------------------
// LEGACY ENDPOINTS
// Registration through invitation links is no longer supported.
// Keep these exports temporarily so existing route imports compile.
// ------------------------------------------------------------

export const verifyInvitation = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.status(410).json({
    success: false,
    message:
      "Invitation registration is no longer available. Please use the login credentials sent by MAYAD.",
  });
};

export const completeArtistRegistration = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.status(410).json({
    success: false,
    message:
      "Self-registration is disabled. Your MAYAD artist account must be created by an administrator.",
  });
};
