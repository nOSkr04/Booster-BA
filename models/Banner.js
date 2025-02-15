import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
  {
    image: {
      type: mongoose.Schema.ObjectId,
      ref: "Image",
    },
    type: {
      type: String,
      default: "web",
      enum: ["web", "mobile"],
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

export default mongoose.model("Banner", BannerSchema);
