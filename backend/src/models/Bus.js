import mongoose from "mongoose";

const busSchema = new mongoose.Schema(
  {
    operatorName: { type: String, required: true },
    busType: { type: String, required: true },
    from: { type: String, required: true, index: true },
    to: { type: String, required: true, index: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 4.5 },
    boardingPoints: [{ type: String }],
    droppingPoints: [{ type: String }],
    availableSeats: { type: Number, default: 30 }
  },
  { timestamps: true }
);

export default mongoose.model("Bus", busSchema);
