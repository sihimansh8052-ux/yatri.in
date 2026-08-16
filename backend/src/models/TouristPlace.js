import mongoose from "mongoose";

const touristPlaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    address: String,
    city: String,
    rating: { type: Number, default: 0 },
    popularity: { type: Number, default: 50 },
    type: { type: String, enum: ["famous", "hidden-gem"], default: "famous" },
    bestTimeToVisit: String,
    tags: [String],
    images: [String],
    category: { type: String, default: "attraction" },
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

touristPlaceSchema.index({ location: "2dsphere" });

export default mongoose.model("TouristPlace", touristPlaceSchema);
