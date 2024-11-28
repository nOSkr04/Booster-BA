import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
  {
    image: {
      type: mongoose.Schema.ObjectId,
      ref: "Image",
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
