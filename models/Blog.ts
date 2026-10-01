import mongoose, { Document, Schema } from "mongoose";

export interface IBlogSection {
  heading?: string;
  headingRaj?: string;
  paragraphs: string[];
  paragraphsRaj: string[];
}

export interface IBlog extends Document {
  slug: string;
  title: string;
  titleRaj: string;
  category: string;
  categoryRaj: string;
  date: string;
  readTime: string;
  readTimeRaj: string;
  author: string;
  authorRole: string;
  imageUrl: string;
  excerpt: string;
  excerptRaj: string;
  content: IBlogSection[];
  tags: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSectionSchema = new Schema<IBlogSection>({
  heading: { type: String, default: "" },
  headingRaj: { type: String, default: "" },
  paragraphs: { type: [String], default: [] },
  paragraphsRaj: { type: [String], default: [] },
});

const BlogSchema = new Schema<IBlog>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    titleRaj: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Cinema & Tech",
    },
    categoryRaj: {
      type: String,
      default: "सिनेमा और तकनीक",
    },
    date: {
      type: String,
      default: "",
    },
    readTime: {
      type: String,
      default: "4 min read",
    },
    readTimeRaj: {
      type: String,
      default: "4 मिनट री पढ़ाई",
    },
    author: {
      type: String,
      default: "MAYAD Editorial",
    },
    authorRole: {
      type: String,
      default: "Entertainment Team",
    },
    imageUrl: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      default: "",
    },
    excerptRaj: {
      type: String,
      default: "",
    },
    content: {
      type: [BlogSectionSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
