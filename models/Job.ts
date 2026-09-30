import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  title: string;
  category: string;
  role?: string;
  location: string;
  employmentType: "Full Time" | "Part Time" | "Internship" | "Freelance" | "Contract";
  experience: string;
  salary?: string;
  description: string;
  responsibilities?: any;
  requirements?: any;
  skills: string[];
  deadline?: Date;
  applicationEmail?: string;
  featured: boolean;
  status: "Draft" | "Published" | "Closed";
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    role: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ["Full Time", "Part Time", "Internship", "Freelance", "Contract"],
      default: "Full Time",
      required: true,
    },
    experience: {
      type: String,
      default: "0-1 Years",
      trim: true,
    },
    salary: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    responsibilities: {
      type: Schema.Types.Mixed,
      default: "",
    },
    requirements: {
      type: Schema.Types.Mixed,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
    },
    applicationEmail: {
      type: String,
      default: "careers@mayad.in",
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Closed"],
      default: "Published",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ status: 1, createdAt: -1 });

const Job = mongoose.models.Job || mongoose.model<IJob>("Job", jobSchema);

export default Job;
