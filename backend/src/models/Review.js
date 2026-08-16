import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: String, required: true },
    targetType: { type: String, enum: ["hotel", "restaurant", "place", "guide"], required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
