import mongoose, { Document, Schema } from "mongoose";

export interface IMovieRole extends Document {
  artist: mongoose.Types.ObjectId;
  movie: mongoose.Types.ObjectId;
  roleName: string;
  characterName: string;
  roleType: "Lead" | "Supporting" | "Cameo" | "Background" | "Other";
  shootingStartDate?: Date;
  shootingEndDate?: Date;
  shootingLocation?: string;
  productionInstructions?: string;
  roleStatus: "Assigned" | "Confirmed" | "Declined" | "Completed" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const movieRoleSchema = new Schema<IMovieRole>(
  {
    artist: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: [true, "Artist reference is required"],
      index: true,
    },
    movie: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie reference is required"],
      index: true,
    },
    roleName: {
      type: String,
      required: [true, "Role name is required"],
      trim: true,
    },
    characterName: {
      type: String,
      required: [true, "Character name is required"],
      trim: true,
    },
    roleType: {
      type: String,
      enum: ["Lead", "Supporting", "Cameo", "Background", "Other"],
      default: "Lead",
      required: true,
    },
    shootingStartDate: {
      type: Date,
    },
    shootingEndDate: {
      type: Date,
    },
    shootingLocation: {
      type: String,
      trim: true,
      default: "",
    },
    productionInstructions: {
      type: String,
      default: "",
    },
    roleStatus: {
      type: String,
      enum: ["Assigned", "Confirmed", "Declined", "Completed", "Cancelled"],
      default: "Assigned",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

movieRoleSchema.index({ movie: 1, artist: 1 });
movieRoleSchema.index({ artist: 1, roleStatus: 1 });

const MovieRole =
  mongoose.models.MovieRole ||
  mongoose.model<IMovieRole>("MovieRole", movieRoleSchema);

export default MovieRole;
