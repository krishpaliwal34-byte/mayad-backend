import mongoose, { Schema, Document } from "mongoose";

export interface ITalentApplication extends Document {
  fullName: string;
  age: number;
  gender: string;
  profilePhoto: string;
  email: string;
  preferredLanguage: string;
  experienceLevel: string;
  interestedRoles: string[];
  yearsOfExperience?: string;
  previousProjects?: string;
  projectVideoUrls?: string[];
  introductoryVideoUrl?: string;
  aboutYourself?: string;
  synopsisPdfUrl?: string;
  whatsAppNumber: string;
  callingNumber: string;
  fullAddress: string;
  city: string;
  state: string;
  country: string;
  socialLink1?: string;
  socialLink2?: string;
  status: "Pending" | "Under Review" | "Shortlisted" | "Approved" | "Rejected";
  createdAt: Date;
  updatedAt: Date;
}

const TalentApplicationSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [1, "Age must be at least 1"],
      max: [120, "Age cannot exceed 120"],
    },
    gender: {
      type: String,
      default: "Prefer not to say",
      trim: true,
    },
    profilePhoto: {
      type: String,
      required: [true, "Profile photo is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    preferredLanguage: {
      type: String,
      enum: ["English", "Hindi", "Both"],
      default: "Both",
    },
    experienceLevel: {
      type: String,
      enum: ["Newcomer", "Experienced"],
      default: "Newcomer",
    },
    interestedRoles: {
      type: [String],
      required: [true, "At least one interested role is required"],
    },
    yearsOfExperience: {
      type: String,
      default: "0",
    },
    previousProjects: {
      type: String,
      default: "",
    },
    projectVideoUrls: {
      type: [String],
      default: [],
    },
    introductoryVideoUrl: {
      type: String,
      default: "",
    },
    aboutYourself: {
      type: String,
      default: "",
    },
    synopsisPdfUrl: {
      type: String,
      default: "",
    },
    whatsAppNumber: {
      type: String,
      required: [true, "WhatsApp number is required"],
      trim: true,
    },
    callingNumber: {
      type: String,
      required: [true, "Calling number is required"],
      trim: true,
    },
    fullAddress: {
      type: String,
      required: [true, "Full address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      default: "India",
    },
    socialLink1: {
      type: String,
      default: "",
      trim: true,
    },
    socialLink2: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Shortlisted", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITalentApplication>(
  "TalentApplication",
  TalentApplicationSchema
);
