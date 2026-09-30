
import mongoose, { Document, Schema } from "mongoose";

export interface IInvitation extends Document {
  artistName: string;
  email: string;
  tokenHash: string;
  expiresAt: Date;
  status: "Pending" | "Accepted" | "Expired";
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    artistName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Store only the hashed token, never the raw email token
    tokenHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Expired"],
      default: "Pending",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// An email can have multiple invitations over time.
// Do not make email unique because expired invitations may be resent.

const Invitation =
  mongoose.models.Invitation ||
  mongoose.model<IInvitation>("Invitation", invitationSchema);

export default Invitation;
