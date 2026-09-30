import mongoose, { Document, Schema } from "mongoose";

export interface IArtistMedia extends Document {
  artist: mongoose.Types.ObjectId;
  mediaType: "photo" | "reel";
  mediaUrl: string;
  thumbnailUrl?: string;
  cloudinaryPublicId: string;
  caption?: string;
  hashtags: string[];
  status: "Pending" | "Approved" | "Rejected";
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const artistMediaSchema = new Schema<IArtistMedia>(
  {
    artist: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
      index: true,
    },
    mediaType: {
      type: String,
      enum: ["photo", "reel"],
      required: true,
      index: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    hashtags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Approved",
      index: true,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

artistMediaSchema.index({ status: 1, createdAt: -1 });
artistMediaSchema.index({ artist: 1, status: 1 });
artistMediaSchema.index({ mediaType: 1, status: 1 });

const ArtistMedia =
  mongoose.models.ArtistMedia ||
  mongoose.model<IArtistMedia>("ArtistMedia", artistMediaSchema);

export default ArtistMedia;
