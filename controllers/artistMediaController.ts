import { Request, Response } from "express";
import mongoose from "mongoose";
import ArtistMedia from "../models/ArtistMedia";
import Artist from "../models/Artist";
import cloudinary from "../utils/cloudinary";
import { ArtistAuthRequest } from "../middleware/artistAuthMiddleware";

// Fix Mongoose typings workaround
const ArtistMediaModel: any = ArtistMedia;
const ArtistModel: any = Artist;

// Helper to configure Cloudinary dynamically with sanitized env credentials
const initCloudinary = () => {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim().replace(/^["']|["']$/g, "");
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim().replace(/^["']|["']$/g, "");

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }
};

// Helper for hashtags parsing
const parseHashtags = (hashtagsInput: any): string[] => {
  if (Array.isArray(hashtagsInput)) {
    return hashtagsInput.map((h) => String(h).trim().replace(/^#/, "")).filter(Boolean);
  }
  if (typeof hashtagsInput === "string") {
    return hashtagsInput
      .split(/[\s,]+/)
      .map((h) => h.trim().replace(/^#/, ""))
      .filter(Boolean);
  }
  return [];
};

// ============================================================
// 1. ARTIST: UPLOAD MEDIA (PHOTO OR REEL)
// POST /api/artist-media/upload
// ============================================================

export const uploadMedia = async (
  req: ArtistAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const artistId = req.userId;
    if (!artistId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Please select a photo or video file to upload",
      });
      return;
    }

    const { caption, hashtags, mediaType: requestedType } = req.body || {};
    const mimeType = req.file.mimetype || "";
    
    // Determine media type
    let mediaType: "photo" | "reel" = "photo";
    if (requestedType === "reel" || mimeType.startsWith("video/")) {
      mediaType = "reel";
    } else if (mimeType.startsWith("image/")) {
      mediaType = "photo";
    } else {
      res.status(400).json({
        success: false,
        message: "Unsupported file type. Allowed formats: JPG, PNG, WebP, MP4, MOV, WebM",
      });
      return;
    }

    // Server-side size validation
    const maxPhotoSize = 10 * 1024 * 1024; // 10MB
    const maxReelSize = 100 * 1024 * 1024; // 100MB

    if (mediaType === "photo" && req.file.size > maxPhotoSize) {
      res.status(400).json({
        success: false,
        message: "Photo size exceeds 10 MB limit",
      });
      return;
    }

    if (mediaType === "reel" && req.file.size > maxReelSize) {
      res.status(400).json({
        success: false,
        message: "Video reel size exceeds 100 MB limit",
      });
      return;
    }

    initCloudinary();

    let mediaUrl = "";
    let thumbnailUrl = "";
    let publicId = `mayad_${mediaType}_${artistId}_${Date.now()}`;

    // Cloudinary upload with Base64 fallback if Cloudinary credentials fail
    try {
      const folderPath = mediaType === "reel" ? "mayad/artists/reels" : "mayad/artists/photos";
      const resourceType = mediaType === "reel" ? "video" : "image";

      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: folderPath,
            public_id: publicId,
            resource_type: resourceType,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file!.buffer);
      });

      if (uploadResult && uploadResult.secure_url) {
        mediaUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id || publicId;
        if (mediaType === "reel") {
          // Cloudinary video thumbnail URL
          thumbnailUrl = uploadResult.secure_url.replace(/\.[^/.]+$/, ".jpg");
        } else {
          thumbnailUrl = uploadResult.secure_url;
        }
      }
    } catch (cloudErr: any) {
      console.warn("Cloudinary upload failed, applying Data URL fallback:", cloudErr?.message || cloudErr);
      const base64 = req.file.buffer.toString("base64");
      mediaUrl = `data:${mimeType};base64,${base64}`;
      thumbnailUrl = mediaUrl;
    }

    if (!mediaUrl) {
      res.status(500).json({
        success: false,
        message: "Failed to process media file",
      });
      return;
    }

    const parsedTags = parseHashtags(hashtags);

    const newMedia = await ArtistMediaModel.create({
      artist: artistId,
      mediaType,
      mediaUrl,
      thumbnailUrl: thumbnailUrl || mediaUrl,
      cloudinaryPublicId: publicId,
      caption: String(caption || "").trim(),
      hashtags: parsedTags,
      status: "Approved",
    });

    res.status(201).json({
      success: true,
      message: `${mediaType === "reel" ? "Reel video" : "Photo"} uploaded and published successfully!`,
      media: newMedia,
    });
  } catch (error: any) {
    console.error("Upload Media Error:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to upload media",
    });
  }
};

// ============================================================
// 2. ARTIST: GET MY MEDIA POSTS
// GET /api/artist-media/my-media
// ============================================================

export const getMyMedia = async (
  req: ArtistAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const artistId = req.userId;
    if (!artistId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { status, mediaType, page = 1, limit = 12 } = req.query as any;
    const query: any = { artist: artistId };

    if (status && status !== "all") {
      query.status = status;
    }

    if (mediaType && mediaType !== "all") {
      query.mediaType = mediaType;
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 12, 1);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await ArtistMediaModel.countDocuments(query);
    const media = await ArtistMediaModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      count: media.length,
      totalCount,
      pages: Math.ceil(totalCount / limitNum),
      page: pageNum,
      media,
    });
  } catch (error: any) {
    console.error("Get My Media Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your media posts",
    });
  }
};

// ============================================================
// 3. ARTIST: UPDATE CAPTION & HASHTAGS
// PUT /api/artist-media/:id
// ============================================================

export const updateMyMedia = async (
  req: ArtistAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const artistId = req.userId;
    const mediaId = String(req.params.id || "");

    if (!artistId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const item = await ArtistMediaModel.findById(mediaId);
    if (!item) {
      res.status(404).json({ success: false, message: "Media post not found" });
      return;
    }

    if (item.artist.toString() !== artistId) {
      res.status(403).json({ success: false, message: "You can only edit your own media" });
      return;
    }

    const { caption, hashtags } = req.body || {};

    if (caption !== undefined) {
      item.caption = String(caption).trim();
    }

    if (hashtags !== undefined) {
      item.hashtags = parseHashtags(hashtags);
    }

    await item.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      media: item,
    });
  } catch (error: any) {
    console.error("Update Media Error:", error);
    res.status(500).json({ success: false, message: "Failed to update media post" });
  }
};

// ============================================================
// 4. ARTIST: DELETE MY MEDIA
// DELETE /api/artist-media/:id
// ============================================================

export const deleteMyMedia = async (
  req: ArtistAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const artistId = req.userId;
    const mediaId = String(req.params.id || "");

    if (!artistId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const item = await ArtistMediaModel.findById(mediaId);
    if (!item) {
      res.status(404).json({ success: false, message: "Media post not found" });
      return;
    }

    if (item.artist.toString() !== artistId) {
      res.status(403).json({ success: false, message: "You can only delete your own media" });
      return;
    }

    initCloudinary();

    // Destroy Cloudinary asset if public id exists
    if (item.cloudinaryPublicId && !item.cloudinaryPublicId.startsWith("data:")) {
      try {
        const resourceType = item.mediaType === "reel" ? "video" : "image";
        await cloudinary.uploader.destroy(item.cloudinaryPublicId, {
          resource_type: resourceType,
        });
      } catch (cloudErr) {
        console.warn("Cloudinary destroy error (skipping):", cloudErr);
      }
    }

    await ArtistMediaModel.findByIdAndDelete(mediaId);

    res.status(200).json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete Media Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete media" });
  }
};

// ============================================================
// 5. PUBLIC: GET APPROVED MEDIA FOR A SPECIFIC ARTIST
// GET /api/artist-media/public/:artistId
// ============================================================

export const getPublicArtistMedia = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const artistId = String(req.params.artistId || "");
    const { mediaType } = req.query as any;

    const query: any = {
      artist: artistId,
      status: "Approved",
    };

    if (mediaType && mediaType !== "all") {
      query.mediaType = mediaType;
    }

    const media = await ArtistMediaModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: media.length,
      media,
    });
  } catch (error: any) {
    console.error("Get Public Artist Media Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch artist portfolio media" });
  }
};

// ============================================================
// 6. PUBLIC: GET ALL APPROVED MEDIA FOR MAIN MAYAD GALLERY
// GET /api/artist-media/public
// ============================================================

export const getPublicAllMedia = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { mediaType, page = 1, limit = 12 } = req.query as any;

    const query: any = { status: "Approved" };

    if (mediaType && mediaType !== "all") {
      query.mediaType = mediaType;
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 12, 1);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await ArtistMediaModel.countDocuments(query);
    const media = await ArtistMediaModel.find(query)
      .populate("artist", "fullName stageName profilePhoto email category location isVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      count: media.length,
      totalCount,
      pages: Math.ceil(totalCount / limitNum),
      page: pageNum,
      media,
    });
  } catch (error: any) {
    console.error("Get Public All Media Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch public media gallery" });
  }
};

// ============================================================
// 7. ADMIN: GET ALL MEDIA FOR MODERATION
// GET /api/artist-media/admin/all
// ============================================================

export const adminGetAllMedia = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, mediaType, page = 1, limit = 15, search } = req.query as any;

    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (mediaType && mediaType !== "all") {
      query.mediaType = mediaType;
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 15, 1);
    const skip = (pageNum - 1) * limitNum;

    let mediaQuery = ArtistMediaModel.find(query)
      .populate("artist", "fullName stageName profilePhoto email category location isVerified")
      .sort({ createdAt: -1 });

    const allRecords = await mediaQuery.lean();

    // Client-side search filtering by artist name/caption/hashtags
    let filtered = allRecords;
    if (search && search.trim()) {
      const q = search.toLowerCase();
      filtered = allRecords.filter((item: any) => {
        const caption = (item.caption || "").toLowerCase();
        const artistName = (item.artist?.fullName || "").toLowerCase();
        const stageName = (item.artist?.stageName || "").toLowerCase();
        const tags = (item.hashtags || []).join(" ").toLowerCase();
        return (
          caption.includes(q) ||
          artistName.includes(q) ||
          stageName.includes(q) ||
          tags.includes(q)
        );
      });
    }

    const totalCount = filtered.length;
    const paginatedMedia = filtered.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      count: paginatedMedia.length,
      totalCount,
      pages: Math.ceil(totalCount / limitNum),
      page: pageNum,
      media: paginatedMedia,
    });
  } catch (error: any) {
    console.error("Admin Get All Media Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch admin media moderation list" });
  }
};

// ============================================================
// 8. ADMIN: APPROVE OR REJECT MEDIA
// PUT /api/artist-media/admin/:id/status
// ============================================================

export const adminUpdateMediaStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const mediaId = String(req.params.id || "");
    const { status, rejectionReason } = req.body || {};

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status value" });
      return;
    }

    const item = await ArtistMediaModel.findById(mediaId);
    if (!item) {
      res.status(404).json({ success: false, message: "Media post not found" });
      return;
    }

    item.status = status;
    if (status === "Rejected") {
      item.rejectionReason = String(rejectionReason || "Does not meet MAYAD platform guidelines").trim();
    } else if (status === "Approved") {
      item.rejectionReason = "";
    }

    await item.save();

    const updated = await ArtistMediaModel.findById(mediaId).populate(
      "artist",
      "fullName stageName profilePhoto email category"
    );

    res.status(200).json({
      success: true,
      message: `Media post marked as ${status}`,
      media: updated,
    });
  } catch (error: any) {
    console.error("Admin Update Media Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update media status" });
  }
};

// ============================================================
// 9. ADMIN: DELETE ANY MEDIA
// DELETE /api/artist-media/admin/:id
// ============================================================

export const adminDeleteMedia = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const mediaId = String(req.params.id || "");

    const item = await ArtistMediaModel.findById(mediaId);
    if (!item) {
      res.status(404).json({ success: false, message: "Media post not found" });
      return;
    }

    initCloudinary();

    if (item.cloudinaryPublicId && !item.cloudinaryPublicId.startsWith("data:")) {
      try {
        const resourceType = item.mediaType === "reel" ? "video" : "image";
        await cloudinary.uploader.destroy(item.cloudinaryPublicId, {
          resource_type: resourceType,
        });
      } catch (cloudErr) {
        console.warn("Cloudinary destroy error (skipping):", cloudErr);
      }
    }

    await ArtistMediaModel.findByIdAndDelete(mediaId);

    res.status(200).json({
      success: true,
      message: "Media deleted permanently by administrator",
    });
  } catch (error: any) {
    console.error("Admin Delete Media Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete media" });
  }
};
