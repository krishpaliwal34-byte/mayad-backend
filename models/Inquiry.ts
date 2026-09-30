import mongoose, { Document, Schema } from "mongoose";

export interface IInquiry extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: "General" | "Production" | "Casting" | "Business" | "Media";
  message: string;
  status: "Pending" | "In Review" | "Resolved" | "Archived";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const inquirySchema = new Schema<IInquiry>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["General", "Production", "Casting", "Business", "Media"],
      default: "General",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Review", "Resolved", "Archived"],
      default: "Pending",
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ status: 1, createdAt: -1 });

const Inquiry =
  mongoose.models.Inquiry ||
  mongoose.model<IInquiry>("Inquiry", inquirySchema);

export default Inquiry;
