import { Request, Response } from "express";
import Movie from "../models/Movie";
import Artist from "../models/Artist";
import MovieRole from "../models/MovieRole";
import Notification from "../models/Notification";
import { ArtistAuthRequest } from "../middleware/artistAuthMiddleware";

const MovieModel: any = Movie;
const ArtistModel: any = Artist;
const MovieRoleModel: any = MovieRole;
const NotificationModel: any = Notification;

// ============================================================
// ADMIN: SEARCH ARTISTS FOR ROLE ASSIGNMENT
// ============================================================
export const adminSearchArtists = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = String(req.query.q || "").trim();

    let searchFilter: any = {};
    if (query) {
      const regex = new RegExp(query, "i");
      searchFilter = {
        $or: [
          { fullName: regex },
          { stageName: regex },
          { email: regex },
          { category: regex },
        ],
      };
    }

    const artists = await ArtistModel.find(searchFilter)
      .select("_id fullName stageName email category profilePhoto location isVerified accountStatus")
      .limit(30)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      artists,
    });
  } catch (error: any) {
    console.error("Admin search artists error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search artists",
    });
  }
};

// ============================================================
// ADMIN: ASSIGN ARTIST TO MOVIE ROLE
// ============================================================
export const adminAssignRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;
    const {
      artistId,
      roleName,
      characterName,
      roleType,
      shootingStartDate,
      shootingEndDate,
      shootingLocation,
      productionInstructions,
    } = req.body;

    if (!artistId || !roleName) {
      res.status(400).json({
        success: false,
        message: "Artist ID and Role Name are required",
      });
      return;
    }

    const movie = await MovieModel.findById(movieId);
    if (!movie) {
      res.status(404).json({
        success: false,
        message: "Movie project not found",
      });
      return;
    }

    const artist = await ArtistModel.findById(artistId);
    if (!artist) {
      res.status(404).json({
        success: false,
        message: "Artist account not found",
      });
      return;
    }

    // Check for duplicate assignment
    const existingRole = await MovieRoleModel.findOne({
      movie: movie._id,
      artist: artist._id,
    });

    if (existingRole) {
      res.status(400).json({
        success: false,
        message: "Artist is already assigned to this project.",
      });
      return;
    }

    const charName = String(characterName || roleName).trim();

    const movieRole = await MovieRoleModel.create({
      movie: movie._id,
      artist: artist._id,
      roleName: String(roleName).trim(),
      characterName: charName,
      roleType: roleType || "Lead",
      shootingStartDate: shootingStartDate ? new Date(shootingStartDate) : undefined,
      shootingEndDate: shootingEndDate ? new Date(shootingEndDate) : undefined,
      shootingLocation: String(shootingLocation || "").trim(),
      productionInstructions: String(productionInstructions || "").trim(),
      roleStatus: "Assigned",
    });

    // Automatically update public movie cast string list if not present
    const artistDisplayName = artist.stageName || artist.fullName;
    if (!movie.cast) movie.cast = [];
    if (!movie.cast.includes(artistDisplayName)) {
      movie.cast.push(artistDisplayName);
      await movie.save();
    }

    // Create Notification for Artist
    await NotificationModel.create({
      recipientId: artist._id,
      recipientType: "Artist",
      title: `New Role Assigned: ${movie.title}`,
      message: `You have been assigned the role of '${characterName}' (${roleName}) in movie project '${movie.title}'. Please review details and respond.`,
      type: "RoleAssigned",
      metadata: {
        movieId: movie._id,
        roleId: movieRole._id,
        roleName: movieRole.roleName,
        characterName: movieRole.characterName,
      },
    });

    const populatedRole = await MovieRoleModel.findById(movieRole._id).populate(
      "artist",
      "_id fullName stageName email category profilePhoto location"
    );

    res.status(201).json({
      success: true,
      message: `Role assigned successfully to ${artistDisplayName}`,
      role: populatedRole,
    });
  } catch (error: any) {
    console.error("Admin assign role error:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to assign role to artist",
    });
  }
};

// ============================================================
// ADMIN: GET ALL ROLES FOR A MOVIE
// ============================================================
export const adminGetMovieRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { movieId } = req.params;
    const roles = await MovieRoleModel.find({ movie: movieId })
      .populate("artist", "_id fullName stageName email category profilePhoto location isVerified")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      roles,
    });
  } catch (error: any) {
    console.error("Admin get movie roles error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch movie roles",
    });
  }
};

// ============================================================
// ADMIN: UPDATE ROLE DETAILS OR STATUS
// ============================================================
export const adminUpdateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roleId } = req.params;
    const {
      roleName,
      characterName,
      roleType,
      shootingStartDate,
      shootingEndDate,
      shootingLocation,
      productionInstructions,
      roleStatus,
    } = req.body;

    const role = await MovieRoleModel.findById(roleId).populate("movie", "title");
    if (!role) {
      res.status(404).json({
        success: false,
        message: "Movie role assignment not found",
      });
      return;
    }

    if (roleName) role.roleName = String(roleName).trim();
    if (characterName) role.characterName = String(characterName).trim();
    if (roleType) role.roleType = roleType;
    if (shootingStartDate) role.shootingStartDate = new Date(shootingStartDate);
    if (shootingEndDate) role.shootingEndDate = new Date(shootingEndDate);
    if (shootingLocation !== undefined) role.shootingLocation = String(shootingLocation).trim();
    if (productionInstructions !== undefined) role.productionInstructions = String(productionInstructions).trim();
    if (roleStatus) role.roleStatus = roleStatus;

    await role.save();

    // Create update notification for the artist
    const movieObj: any = role.movie;
    const movieTitle = movieObj?.title || "Movie Project";

    await NotificationModel.create({
      recipientId: role.artist,
      recipientType: "Artist",
      title: `Role Update: ${movieTitle}`,
      message: `The shooting schedule or role parameters for character '${role.characterName}' in '${movieTitle}' have been updated by MAYAD Admin.`,
      type: "RoleUpdated",
      metadata: {
        movieId: role.movie,
        roleId: role._id,
      },
    });

    const updatedRole = await MovieRoleModel.findById(role._id).populate(
      "artist",
      "_id fullName stageName email category profilePhoto location"
    );

    res.json({
      success: true,
      message: "Role updated successfully",
      role: updatedRole,
    });
  } catch (error: any) {
    console.error("Admin update role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update role",
    });
  }
};

// ============================================================
// ADMIN: REMOVE ROLE ASSIGNMENT
// ============================================================
export const adminRemoveRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roleId } = req.params;
    const role = await MovieRoleModel.findByIdAndDelete(roleId);

    if (!role) {
      res.status(404).json({
        success: false,
        message: "Role assignment not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Role assignment removed successfully",
    });
  } catch (error: any) {
    console.error("Admin remove role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove role assignment",
    });
  }
};

// ============================================================
// ARTIST: GET MY ASSIGNED PROJECTS & ROLES
// Derives artist ID strictly from session (req.userId)
// ============================================================
export const artistGetMyProjects = async (req: ArtistAuthRequest, res: Response): Promise<void> => {
  try {
    const artistId = req.userId;
    if (!artistId) {
      res.status(401).json({
        success: false,
        message: "Artist authentication required",
      });
      return;
    }

    const roles = await MovieRoleModel.find({ artist: artistId })
      .populate("movie")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      roles,
    });
  } catch (error: any) {
    console.error("Artist get my projects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load assigned projects",
    });
  }
};

// ============================================================
// ARTIST: ACCEPT OR DECLINE ASSIGNED ROLE
// ============================================================
export const artistRespondRole = async (req: ArtistAuthRequest, res: Response): Promise<void> => {
  try {
    const artistId = req.userId;
    const { roleId } = req.params;
    const { response } = req.body; // "Confirmed" | "Declined"

    if (!["Confirmed", "Declined"].includes(response)) {
      res.status(400).json({
        success: false,
        message: "Invalid response status. Must be 'Confirmed' or 'Declined'",
      });
      return;
    }

    const role = await MovieRoleModel.findOne({ _id: roleId, artist: artistId }).populate("movie", "title");

    if (!role) {
      res.status(404).json({
        success: false,
        message: "Assigned role not found for your account",
      });
      return;
    }

    role.roleStatus = response;
    await role.save();

    const artist = req.artist;
    const artistName = artist?.stageName || artist?.fullName || "Artist";
    const movieObj: any = role.movie;
    const movieTitle = movieObj?.title || "Movie Project";

    // Notify CEO Admin
    await NotificationModel.create({
      recipientId: artistId as any,
      recipientType: "Admin",
      title: `Artist ${response}: ${movieTitle}`,
      message: `Artist '${artistName}' has ${response.toLowerCase()} the role of '${role.characterName}' in movie project '${movieTitle}'.`,
      type: "RoleResponded",
      metadata: {
        movieId: role.movie,
        roleId: role._id,
        artistId,
        response,
      },
    });

    res.json({
      success: true,
      message: `Role status updated to ${response}`,
      role,
    });
  } catch (error: any) {
    console.error("Artist respond role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process role response",
    });
  }
};

// ============================================================
// ARTIST: GET NOTIFICATIONS
// ============================================================
export const artistGetNotifications = async (req: ArtistAuthRequest, res: Response): Promise<void> => {
  try {
    const artistId = req.userId;
    const notifications = await NotificationModel.find({ recipientId: artistId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await NotificationModel.countDocuments({ recipientId: artistId, isRead: false });

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error("Artist notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// ============================================================
// ARTIST: MARK NOTIFICATION READ
// ============================================================
export const artistMarkNotificationRead = async (req: ArtistAuthRequest, res: Response): Promise<void> => {
  try {
    const artistId = req.userId;
    const { notificationId } = req.params;

    if (notificationId === "all") {
      await NotificationModel.updateMany({ recipientId: artistId, isRead: false }, { isRead: true });
    } else {
      await NotificationModel.updateOne({ _id: notificationId, recipientId: artistId }, { isRead: true });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error: any) {
    console.error("Mark notification read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};
