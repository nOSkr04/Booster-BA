import mongoose from "mongoose";

const VoucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    activeUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    activeAt: Date,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("Voucher", VoucherSchema);
