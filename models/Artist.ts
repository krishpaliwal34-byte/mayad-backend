import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IArtist extends Document {
  fullName: string;
  email: string;
  phone?: string;
  password: string;

  dob?: string;
  gender?: string;
  city?: string;
  state?: string;
  artistRole?: string;

  category?: string;
  secondaryCategory?: string;
  experience?: string;
  location?: string;
  languages?: string[];
  bio?: string;

  stageName?: string;
  profilePhoto?: string;
  showreel?: string;
  imdb?: string;
  instagram?: string;

  role: "artist";
  isVerified: boolean;
  accountStatus: "Pending Approval" | "Approved" | "Rejected";

  mustChangePassword: boolean;

  invitationId?: mongoose.Types.ObjectId;

  resetPasswordTokenHash?: string;
  resetPasswordExpiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const artistSchema = new Schema<IArtist>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      default: undefined,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    dob: {
      type: String,
      trim: true,
      default: "",
    },

    gender: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    artistRole: {
      type: String,
      trim: true,
      default: "",
    },

    // Temporary-password first-login control
    mustChangePassword: {
      type: Boolean,
      default: false,
    },

    category: {
      type: String,
      trim: true,
      default: "",
    },

    secondaryCategory: {
      type: String,
      trim: true,
      default: "",
    },

    experience: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    languages: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      trim: true,
      default: "",
    },

    stageName: {
      type: String,
      trim: true,
      default: "",
    },

    profilePhoto: {
      type: String,
      trim: true,
      default: "",
    },

    showreel: {
      type: String,
      trim: true,
      default: "",
    },

    imdb: {
      type: String,
      trim: true,
      default: "",
    },

    instagram: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: ["artist"],
      default: "artist",
      immutable: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    accountStatus: {
      type: String,
      enum: ["Pending Approval", "Approved", "Rejected"],
      default: "Approved", // Approved on registration or Pending Approval
    },

    invitationId: {
      type: Schema.Types.ObjectId,
      ref: "Invitation",
    },

    resetPasswordTokenHash: {
      type: String,
      select: false,
    },

    resetPasswordExpiresAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving.
// Password is hashed only when it has been modified.
artistSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare login password with stored bcrypt hash.
artistSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const Artist =
  mongoose.models.Artist ||
  mongoose.model<IArtist>("Artist", artistSchema);

export default Artist;
