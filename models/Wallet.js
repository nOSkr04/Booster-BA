import mongoose from "mongoose";
const WalletSchema = new mongoose.Schema(
  {
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "Cv",
    },
    invoiceId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      default: 0,
    },
    isPayed: {
      type: Boolean,
      default: false,
    },
    qrImage: {
      type: String,
      default: null,
    },
    invoiceType: String,
    urls: [
      {
        name: String,
        description: String,
        logo: String,
        link: String,
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("Wallet", WalletSchema);
