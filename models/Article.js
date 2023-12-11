import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    video: {
      type: mongoose.Schema.ObjectId,
      ref: "Video",
    },
    seen: {
      type: Number,
      default: 0,
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    updateUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("Article", ArticleSchema);
