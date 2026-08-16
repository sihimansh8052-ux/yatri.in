import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    address: String,
    city: String,
    priceLevel: { type: String, enum: ["budget", "mid", "premium"], default: "mid" },
    pricePerNight: Number,
    rating: { type: Number, default: 0 },
    popularity: { type: Number, default: 50 },
    amenities: [String],
    aliases: [String],
    images: [String],
    category: { type: String, default: "hotel" },
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

hotelSchema.index({ location: "2dsphere" });

export default mongoose.model("Hotel", hotelSchema);
