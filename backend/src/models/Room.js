import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    type: {
      type: String,
      enum: ["Standard Room", "Deluxe Room", "Executive Room", "Family Room", "Luxury Suite", "Presidential Suite"],
      required: true
    },
    pricePerNight: { type: Number, required: true },
    capacity: { type: Number, required: true },
    beds: { type: Number, default: 1 },
    facilities: [String],
    images: [String],
    availability: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
