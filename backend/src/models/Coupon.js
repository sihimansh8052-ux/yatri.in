import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountPercentage: { type: Number, required: true },
    maxDiscount: { type: Number, required: true },
    minBookingAmount: { type: Number, default: 0 },
    applicableCategory: {
      type: String,
      enum: ["all", "hotel", "flight", "train", "bus", "package", "guide"],
      default: "all"
    },
    validUntil: { type: Date, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
