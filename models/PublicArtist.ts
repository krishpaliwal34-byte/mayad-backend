import mongoose, { Schema, Document } from "mongoose";

export interface IPublicArtist extends Document {
  legacyId: string;
  slug: string;
  name: string;
  originalName?: string;
  role: string;
  imageUrl: string;
  bio: string;
  dob?: Date;
  birthPlace?: string;
  highlights: string[];
  tag?: string;
}

const PublicArtistSchema = new Schema<IPublicArtist>(
  {
    legacyId: {
      type: String,
      required: true,
      unique: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    originalName: String,
    role: String,

    imageUrl: {
      type: String,
      default: "/Default.jpg",
    },

    bio: {
      type: String,
      default: "",
    },

    dob: Date,
    birthPlace: String,

    highlights: {
      type: [String],
      default: [],
    },

    tag: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPublicArtist>(
  "PublicArtist",
  PublicArtistSchema
);