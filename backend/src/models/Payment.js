import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    amount: { type: Number, required: true },
    baseAmount: Number,
    platformFee: Number,
    commissionAmount: Number,
    platformRevenue: Number,
    partnerPayout: Number,
    revenueModel: String,
    currency: { type: String, default: "INR" },
    paymentId: { type: String, required: true, unique: true },
    gateway: { type: String, enum: ["stripe", "razorpay", "wallet"], default: "stripe" },
    status: { type: String, enum: ["pending", "success", "failed", "refunded"], default: "success" }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
