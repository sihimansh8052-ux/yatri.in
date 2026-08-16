import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    address: String,
    city: String,
    priceLevel: { type: String, enum: ["budget", "mid", "premium"], default: "mid" },
    rating: { type: Number, default: 0 },
    popularity: { type: Number, default: 50 },
    cuisine: [String],
    menuHighlights: [String],
    images: [String],
    category: { type: String, default: "restaurant" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: { type: [Number], required: true }
    }
  },
  { timestamps: true }
);

restaurantSchema.index({ location: "2dsphere" });

export default mongoose.model("Restaurant", restaurantSchema);
