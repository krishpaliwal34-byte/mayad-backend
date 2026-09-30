import mongoose, { Schema, Document } from 'mongoose';

export interface IJobApplication extends Document {
  job: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  resume: string; // URL or document link
  portfolioUrl?: string;
  linkedInUrl?: string;
  coverLetter?: string;
  status: 'Applied' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema: Schema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    resume: {
      type: String,
      required: [true, 'Resume link/file is required'],
      trim: true,
    },
    portfolioUrl: {
      type: String,
      trim: true,
      default: '',
    },
    linkedInUrl: {
      type: String,
      trim: true,
      default: '',
    },
    coverLetter: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
      default: 'Applied',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
