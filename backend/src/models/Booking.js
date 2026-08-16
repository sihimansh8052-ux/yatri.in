import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookingType: {
      type: String,
      enum: ["hotel", "bus", "train", "package", "guide"],
      default: "hotel"
    },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    guide: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bus: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
    train: { type: mongoose.Schema.Types.ObjectId, ref: "Train" },
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    checkIn: Date,
    checkOut: Date,
    date: Date,
    durationDays: Number,
    seatNumber: String,
    classType: String,
    boardingPoint: String,
    droppingPoint: String,
    hotelName: String,
    roomType: String,
    passengerName: String,
    pnrNumber: String,
    guests: { type: Number, default: 1 },
    status: { type: String, enum: ["confirmed", "pending", "cancelled"], default: "confirmed" },
    baseAmount: Number,
    commissionRate: Number,
    commissionAmount: Number,
    platformFee: Number,
    platformRevenue: Number,
    partnerPayout: Number,
    revenueModel: String,
    totalPrice: Number,
    paymentId: String,
    paymentStatus: { type: String, enum: ["pending", "success", "failed"], default: "pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
