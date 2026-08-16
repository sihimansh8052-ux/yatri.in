import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Bus from "../models/Bus.js";
import Train from "../models/Train.js";
import mongoose from "mongoose";

const toValidObjectId = (str) => {
  if (!str) return null;
  if (mongoose.Types.ObjectId.isValid(str)) {
    return new mongoose.Types.ObjectId(str);
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let result = "";
  for (let i = 0; i < 12; i++) {
    const value = (hash >> (i * 2)) & 0xFF;
    result += ("00" + value.toString(16)).slice(-2);
  }
  return new mongoose.Types.ObjectId((result + "1234567890abcdef").slice(0, 24));
};
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";
import { getRevenueBreakdown } from "../utils/revenue.js";

const getNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null;
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
};

const resolveBookingFromApi = async ({
  bookingType,
  hotelId,
  roomId,
  busId,
  trainId,
  guideId,
  packageId,
  checkIn,
  checkOut,
  durationDays,
  guests,
  totalPrice,
  boardingPoint,
  droppingPoint
}) => {
  if (bookingType === "hotel") {
    if (!hotelId || !roomId) {
      return { error: "Hotel and room selection are required" };
    }
    if (!mongoose.Types.ObjectId.isValid(hotelId) || !mongoose.Types.ObjectId.isValid(roomId)) {
      return { error: "Invalid hotel or room selection" };
    }

    const [hotel, room] = await Promise.all([
      Hotel.findById(hotelId),
      Room.findOne({ _id: roomId, hotel: hotelId, availability: true })
    ]);
    if (!hotel) return { error: "Hotel not found" };
    if (!room) return { error: "Selected room is no longer available" };

    const nights = getNights(checkIn, checkOut);
    if (!nights) return { error: "Check-out date must be after check-in date" };
    if (Number(guests) > room.capacity) {
      return { error: `Selected room supports up to ${room.capacity} guests` };
    }

    return {
      totalPrice: nights * room.pricePerNight,
      hotelName: hotel.name,
      roomType: room.type
    };
  }

  if (bookingType === "bus") {
    if (!busId || !mongoose.Types.ObjectId.isValid(busId)) {
      return { error: "Valid bus selection is required" };
    }
    const bus = await Bus.findById(busId);
    if (!bus) return { error: "Selected bus is no longer available" };
    if (bus.availableSeats <= 0) return { error: "Selected bus is sold out" };
    if (boardingPoint && !bus.boardingPoints.includes(boardingPoint)) {
      return { error: "Invalid boarding point for selected bus" };
    }
    if (droppingPoint && !bus.droppingPoints.includes(droppingPoint)) {
      return { error: "Invalid dropping point for selected bus" };
    }

    return { totalPrice: bus.price };
  }

  if (bookingType === "train") {
    if (!trainId || !mongoose.Types.ObjectId.isValid(trainId)) {
      return { error: "Valid train selection is required" };
    }
    const train = await Train.findById(trainId);
    if (!train) return { error: "Selected train is no longer available" };
    if (train.availableSeats <= 0) return { error: "Selected train is sold out" };
    if (boardingPoint && !train.boardingStations.includes(boardingPoint)) {
      return { error: "Invalid boarding station for selected train" };
    }
    if (droppingPoint && !train.droppingStations.includes(droppingPoint)) {
      return { error: "Invalid dropping station for selected train" };
    }

    return { totalPrice: train.price };
  }

  if (bookingType === "guide") {
    if (!guideId || !mongoose.Types.ObjectId.isValid(guideId)) {
      return { error: "Valid guide selection is required" };
    }
    const guide = await User.findOne({ _id: guideId, role: "tour_guide" });
    if (!guide) return { error: "Guide not found" };
    return { totalPrice: (Number(durationDays) || 1) * (guide.pricePerDay || Number(totalPrice) || 1200) };
  }

  if (bookingType === "package") {
    return { totalPrice: Number(totalPrice) || 1200 };
  }

  return { error: "Unsupported booking type" };
};

export const getBookings = async (req, res) => {
  if (!isDatabaseConnected()) {
    const bookings = fallbackStore.getBookings(String(req.user._id));
    return res.json(bookings);
  }

  const bookings = await Booking.find({ user: req.user._id })
    .populate("user", "name email mobile")
    .populate("hotel")
    .populate("guide", "name email mobile profilePhoto experience languagesSpoken pricePerDay bio")
    .populate("bus")
    .populate("train")
    .populate("package");
  res.json(bookings);
};

export const createBooking = async (req, res) => {
  try {
    const {
      hotelId,
      roomId,
      guideId,
      busId,
      trainId,
      packageId,
      checkIn,
      checkOut,
      date,
      durationDays,
      seatNumber,
      classType,
      boardingPoint,
      droppingPoint,
      passengerName,
      pnrNumber,
      hotelName,
      roomType,
      guests = 1,
      totalPrice,
      paymentId,
      bookingType = "hotel"
    } = req.body;

    const userId = String(req.user._id);

    if (!isDatabaseConnected()) {
      const revenue = getRevenueBreakdown(bookingType, Number(totalPrice) || 1200);
      const booking = fallbackStore.createBooking({
        userId,
        bookingType,
        hotelId,
        roomId,
        guideId,
        busId,
        trainId,
        packageId,
        checkIn,
        checkOut,
        date,
        durationDays,
        seatNumber,
        classType,
        boardingPoint,
        droppingPoint,
        passengerName,
        pnrNumber,
        hotelName,
        roomType,
        guests,
        paymentId,
        ...revenue
      });
      return res.status(201).json(booking);
    }

    const apiResolved = await resolveBookingFromApi({
      bookingType,
      hotelId,
      roomId,
      busId,
      trainId,
      guideId,
      packageId,
      checkIn,
      checkOut,
      durationDays,
      guests,
      totalPrice,
      boardingPoint,
      droppingPoint
    });

    if (apiResolved.error) {
      return res.status(400).json({ message: apiResolved.error });
    }

    const revenue = getRevenueBreakdown(bookingType, apiResolved.totalPrice);

    const booking = await Booking.create({
      user: req.user._id,
      bookingType,
      hotel: hotelId ? (mongoose.Types.ObjectId.isValid(hotelId) ? hotelId : toValidObjectId(hotelId)) : undefined,
      room: roomId ? (mongoose.Types.ObjectId.isValid(roomId) ? roomId : toValidObjectId(roomId)) : undefined,
      guide: guideId ? (mongoose.Types.ObjectId.isValid(guideId) ? guideId : toValidObjectId(guideId)) : undefined,
      bus: busId ? (mongoose.Types.ObjectId.isValid(busId) ? busId : toValidObjectId(busId)) : undefined,
      train: trainId ? (mongoose.Types.ObjectId.isValid(trainId) ? trainId : toValidObjectId(trainId)) : undefined,
      package: packageId ? (mongoose.Types.ObjectId.isValid(packageId) ? packageId : toValidObjectId(packageId)) : undefined,
      checkIn,
      checkOut,
      date,
      durationDays,
      seatNumber,
      classType,
      boardingPoint,
      droppingPoint,
      hotelName: apiResolved.hotelName || hotelName,
      roomType: apiResolved.roomType || roomType,
      passengerName,
      pnrNumber,
      guests,
      status: "confirmed",
      paymentStatus: "success",
      paymentId: paymentId || `pay_mock_${Math.floor(100000 + Math.random() * 900000)}`,
      ...revenue
    });

    if (bookingType === "bus" && busId && mongoose.Types.ObjectId.isValid(busId)) {
      await Bus.findByIdAndUpdate(busId, { $inc: { availableSeats: -1 } });
    }
    if (bookingType === "train" && trainId && mongoose.Types.ObjectId.isValid(trainId)) {
      await Train.findByIdAndUpdate(trainId, { $inc: { availableSeats: -1 } });
    }

    // Create corresponding payment gateway transaction document
    try {
      await Payment.create({
        user: req.user._id,
        booking: booking._id,
        amount: booking.totalPrice,
        baseAmount: booking.baseAmount,
        platformFee: booking.platformFee,
        commissionAmount: booking.commissionAmount,
        platformRevenue: booking.platformRevenue,
        partnerPayout: booking.partnerPayout,
        revenueModel: booking.revenueModel,
        paymentId: booking.paymentId,
        gateway: booking.paymentId.startsWith("pay_stripe_") ? "stripe" : booking.paymentId.startsWith("pay_wallet_") ? "wallet" : "razorpay",
        status: "success"
      });
    } catch (e) {
      console.warn("Failed to create separate payment log:", e.message);
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to process booking" });
  }
};

export const updateBookingStatus = async (req, res) => {
  if (!isDatabaseConnected()) {
    const booking = fallbackStore.updateBookingStatus(
      String(req.user._id),
      req.params.id,
      req.body.status
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    return res.json(booking);
  }

  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  booking.status = req.body.status;
  await booking.save();
  res.json(booking);
};

export const verifyPayment = async (req, res) => {
  const { bookingId, paymentId } = req.body;
  if (!bookingId || !paymentId) {
    return res.status(400).json({ message: "bookingId and paymentId are required" });
  }

  if (!isDatabaseConnected()) {
    const booking = fallbackStore.updateBookingStatus(null, bookingId, "confirmed");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.paymentStatus = "success";
    booking.paymentId = paymentId;
    return res.json({ success: true, booking });
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ message: "Booking not found" });

  booking.status = "confirmed";
  booking.paymentStatus = "success";
  booking.paymentId = paymentId;
  await booking.save();

  res.json({ success: true, booking });
};
