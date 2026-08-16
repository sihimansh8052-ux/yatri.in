import mongoose from "mongoose";

const trainSchema = new mongoose.Schema(
  {
    trainNumber: { type: String, required: true, unique: true, index: true },
    trainName: { type: String, required: true },
    trainType: { type: String, default: "Express" },
    from: { type: String, required: true, index: true },
    to: { type: String, required: true, index: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 4.5 },
    boardingStations: [{ type: String }],
    droppingStations: [{ type: String }],
    availableSeats: { type: Number, default: 120 },
    classes: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model("Train", trainSchema);
