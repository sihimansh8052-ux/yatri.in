import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";
import { getRevenueBreakdown } from "../utils/revenue.js";

export const getUsers = async (req, res) => {
  if (!isDatabaseConnected()) {
    const list = await fallbackStore.getAllUsers();
    return res.json(list);
  }
  const list = await User.find().select("-password -refreshTokens");
  res.json(list);
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ message: "role is required" });

  if (!isDatabaseConnected()) {
    const user = await fallbackStore.saveUserPatch(req.params.id, { role });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

export const deleteUser = async (req, res) => {
  if (!isDatabaseConnected()) {
    const deleted = await fallbackStore.deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "User deleted successfully" });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted successfully" });
};

export const getBookings = async (req, res) => {
  if (!isDatabaseConnected()) {
    const list = fallbackStore.getAllBookings();
    return res.json(list);
  }

  const list = await Booking.find()
    .populate("hotel")
    .populate("guide", "name email mobile profilePhoto")
    .populate("user", "name email");
  res.json(list);
};

export const updateBooking = async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: "status is required" });

  if (!isDatabaseConnected()) {
    const booking = fallbackStore.updateBookingStatus(null, req.params.id, status);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    return res.json(booking);
  }

  const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true })
    .populate("hotel")
    .populate("guide", "name email mobile profilePhoto")
    .populate("user", "name email");
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
};

export const deleteBooking = async (req, res) => {
  if (!isDatabaseConnected()) {
    const deleted = fallbackStore.adminDeleteBooking(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });
    return res.json({ message: "Booking deleted successfully" });
  }

  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json({ message: "Booking deleted successfully" });
};

export const getRevenueSummary = async (_req, res) => {
  if (!isDatabaseConnected()) {
    const bookings = fallbackStore.getAllBookings();
    const rows = bookings.map((booking) => ({
      ...booking,
      ...getRevenueBreakdown(booking.bookingType || "hotel", booking.baseAmount || booking.totalPrice || 0)
    }));
    return res.json(buildRevenueSummary(rows, []));
  }

  const [bookings, payments] = await Promise.all([
    Booking.find({ paymentStatus: "success" }).sort({ createdAt: -1 }).lean(),
    Payment.find({ status: "success" }).sort({ createdAt: -1 }).lean()
  ]);

  const rows = bookings.map((booking) => {
    if (booking.platformRevenue !== undefined) return booking;
    return {
      ...booking,
      ...getRevenueBreakdown(booking.bookingType || "hotel", booking.totalPrice || 0)
    };
  });

  res.json(buildRevenueSummary(rows, payments));
};

const buildRevenueSummary = (bookings, payments) => {
  const totals = bookings.reduce(
    (sum, booking) => {
      sum.grossSales += Number(booking.totalPrice || 0);
      sum.baseSales += Number(booking.baseAmount || 0);
      sum.platformRevenue += Number(booking.platformRevenue || 0);
      sum.partnerPayouts += Number(booking.partnerPayout || 0);
      sum.platformFees += Number(booking.platformFee || 0);
      sum.commissions += Number(booking.commissionAmount || 0);
      sum.bookingCount += 1;
      return sum;
    },
    {
      grossSales: 0,
      baseSales: 0,
      platformRevenue: 0,
      partnerPayouts: 0,
      platformFees: 0,
      commissions: 0,
      bookingCount: 0
    }
  );

  const byType = bookings.reduce((acc, booking) => {
    const key = booking.bookingType || "hotel";
    if (!acc[key]) {
      acc[key] = { bookingType: key, bookings: 0, grossSales: 0, platformRevenue: 0, partnerPayouts: 0 };
    }
    acc[key].bookings += 1;
    acc[key].grossSales += Number(booking.totalPrice || 0);
    acc[key].platformRevenue += Number(booking.platformRevenue || 0);
    acc[key].partnerPayouts += Number(booking.partnerPayout || 0);
    return acc;
  }, {});

  return {
    totals,
    byType: Object.values(byType),
    monetizationPlans: [
      { name: "Hotel featured listing", price: 2999, billing: "monthly", target: "Hotels" },
      { name: "Guide Verified Plus", price: 1999, billing: "monthly", target: "Tour Guides" },
      { name: "Food partner boost", price: 999, billing: "monthly", target: "Restaurants" },
      { name: "Homepage premium feature", price: 7999, billing: "monthly", target: "Hotels, guides, packages" }
    ],
    recentPayments: payments.slice(0, 8)
  };
};
