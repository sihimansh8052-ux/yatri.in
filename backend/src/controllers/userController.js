import User from "../models/User.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";

const dashboardTemplates = {
  traveler: {
    shortcuts: ["Search Destinations", "Book Hotels", "Book Guides", "View Trips", "Payments", "Reviews", "Wishlist"],
    widgets: ["Upcoming Trips", "Saved Hotels", "Favorite Destinations", "Travel Wallet", "Reward Points"]
  },
  tour_guide: {
    shortcuts: ["Accept/Reject Booking", "Manage Availability", "View Earnings", "Chat with Travelers", "Calendar", "Reviews"],
    widgets: ["Today Schedule", "Pending Requests", "Monthly Earnings", "Traveler Messages"]
  },
  hotel_owner: {
    shortcuts: ["Manage Hotels", "Add/Edit/Delete Rooms", "Manage Bookings", "Revenue Analytics", "Customer Reviews"],
    widgets: ["Occupancy", "Revenue", "Booking Pipeline", "Room Inventory"]
  },
  admin: {
    shortcuts: [
      "Manage Users",
      "Manage Hotels",
      "Manage Guides",
      "Manage Bookings",
      "Manage Payments",
      "Dashboard Analytics",
      "Reports",
      "Revenue",
      "User Verification",
      "Guide Approval",
      "Hotel Approval",
      "CMS Management"
    ],
    widgets: ["Platform Revenue", "Active Users", "Pending Approvals", "Reports"]
  }
};

const publicUser = (user) => {
  const { password, refreshTokens, emailOtp, mobileOtp, resetPasswordToken, ...safeUser } =
    typeof user.toObject === "function" ? user.toObject() : user;
  return safeUser;
};

const roleOf = (user) => (user.role === "user" ? "traveler" : user.role || "traveler");

export const updateProfile = async (req, res) => {
  const allowed = [
    "name",
    "mobile",
    "email",
    "country",
    "state",
    "city",
    "profilePhoto",
    "language",
    "preferences",
    "emergencyContacts",
    "interests"
  ];
  const patch = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));

  if (!isDatabaseConnected()) {
    const updatedUser = await fallbackStore.saveUserPatch(String(req.user._id), patch);
    return res.json(updatedUser);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  Object.assign(user, patch);
  await user.save();
  res.json(publicUser(user));
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!newPassword || newPassword !== confirmPassword) {
    return res.status(400).json({ message: "New passwords must match" });
  }

  if (!isDatabaseConnected()) {
    const rawUser = await fallbackStore.findUserById(String(req.user._id));
    const valid = await fallbackStore.comparePassword(rawUser, currentPassword);
    if (!valid) return res.status(400).json({ message: "Current password is incorrect" });
    await fallbackStore.setPassword(String(req.user._id), newPassword);
    return res.json({ message: "Password updated successfully" });
  }

  const user = await User.findById(req.user._id);
  const valid = await user.matchPassword(currentPassword);
  if (!valid) return res.status(400).json({ message: "Current password is incorrect" });
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated successfully" });
};

export const deleteAccount = async (req, res) => {
  if (!isDatabaseConnected()) {
    await fallbackStore.deleteUser(String(req.user._id));
    return res.json({ message: "Account deleted successfully" });
  }
  await User.findByIdAndDelete(req.user._id);
  res.json({ message: "Account deleted successfully" });
};

export const getDashboard = async (req, res) => {
  const user = isDatabaseConnected()
    ? await User.findById(req.user._id).select("-password -refreshTokens -emailOtp -mobileOtp -resetPasswordToken")
    : await fallbackStore.findUserById(String(req.user._id));
  const role = roleOf(user);
  const template = dashboardTemplates[role] || dashboardTemplates.traveler;

  res.json({
    user: publicUser(user),
    role,
    welcome: `Welcome back, ${user.name}`,
    template,
    stats: {
      hotelBookings: 3,
      guideBookings: role === "tour_guide" ? 8 : 1,
      upcomingTrips: 2,
      tripHistory: 7,
      savedHotels: user.savedPlaces?.filter((item) => item.placeType === "hotel").length || 0,
      wishlist: user.savedPlaces?.length || 0,
      favoriteDestinations: 5,
      pendingPayments: 1,
      notifications: user.notifications?.filter((item) => !item.read).length || 0,
      messages: 4,
      rewardPoints: user.rewardPoints || 0,
      walletBalance: user.walletBalance || 0
    },
    bookings: {
      hotels: [
        { id: "HB-1042", name: "Lotus Residency", status: "Confirmed", date: "2026-08-14", amount: 4200 },
        { id: "HB-1048", name: "Aravalli Suites", status: "Pending", date: "2026-09-02", amount: 8600 }
      ],
      guides: [{ id: "GB-2201", name: "Old Delhi Heritage Walk", status: "Confirmed", date: "2026-08-15" }]
    },
    trips: {
      upcoming: ["Delhi food trail", "Agra sunrise visit"],
      history: ["Jaipur weekend", "Mumbai coastal tour"]
    },
    payments: [
      { id: "PAY-9821", label: "Hotel advance", status: "Paid", amount: 2100 },
      { id: "PAY-9827", label: "Guide booking", status: "Pending", amount: 900 }
    ],
    messages: [
      { from: "Tour Guide Asha", text: "I will meet you near Gate 2 at 9 AM." },
      { from: "Yatri Support", text: "Your itinerary PDF is ready." }
    ],
    approvals: role === "admin" ? ["Guide Approval", "Hotel Approval", "User Verification"] : []
  });
};

export const savePlace = async (req, res) => {
  const { placeId, placeType } = req.body;
  if (!isDatabaseConnected()) {
    await fallbackStore.addSavedPlace(String(req.user._id), { placeId, placeType });
    const user = await fallbackStore.addNotification(String(req.user._id), {
      title: "Saved to wishlist",
      message: `A ${placeType} was added to your saved places.`
    });
    return res.json(user.savedPlaces);
  }

  const user = await User.findById(req.user._id);
  const exists = user.savedPlaces.some(
    (item) => String(item.placeId) === placeId && item.placeType === placeType
  );
  if (!exists) {
    user.savedPlaces.push({ placeId, placeType });
    user.notifications.push({
      title: "Saved to wishlist",
      message: `A ${placeType} was added to your saved places.`
    });
    await user.save();
  }
  res.json(user.savedPlaces);
};

export const removeSavedPlace = async (req, res) => {
  const { placeId, placeType } = req.body;
  if (!isDatabaseConnected()) {
    const user = await fallbackStore.removeSavedPlace(String(req.user._id), placeId, placeType);
    return res.json(user.savedPlaces);
  }

  const user = await User.findById(req.user._id);
  user.savedPlaces = user.savedPlaces.filter(
    (item) => !(String(item.placeId) === placeId && item.placeType === placeType)
  );
  await user.save();
  res.json(user.savedPlaces);
};

export const addSearchHistory = async (req, res) => {
  const { query } = req.body;
  if (!isDatabaseConnected()) {
    const user = await fallbackStore.addSearchHistory(String(req.user._id), query);
    return res.json(user.searchHistory);
  }

  const user = await User.findById(req.user._id);
  user.searchHistory.unshift({ query });
  user.searchHistory = user.searchHistory.slice(0, 10);
  await user.save();
  res.json(user.searchHistory);
};

export const getNotifications = async (req, res) => {
  if (!isDatabaseConnected()) {
    const user = await fallbackStore.findUserById(String(req.user._id));
    return res.json((user?.notifications || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }

  const user = await User.findById(req.user._id).select("notifications");
  res.json(user.notifications.sort((a, b) => b.createdAt - a.createdAt));
};

export const createItinerary = async (req, res) => {
  if (!isDatabaseConnected()) {
    const itineraries = await fallbackStore.createItinerary(String(req.user._id), req.body);
    await fallbackStore.addNotification(String(req.user._id), {
      title: "Itinerary updated",
      message: "Your trip plan has been saved."
    });
    return res.status(201).json(itineraries);
  }

  const user = await User.findById(req.user._id);
  user.itineraryPlans.push(req.body);
  user.notifications.push({
    title: "Itinerary updated",
    message: "Your trip plan has been saved."
  });
  await user.save();
  res.status(201).json(user.itineraryPlans);
};

export const updateItinerary = async (req, res) => {
  if (!isDatabaseConnected()) {
    const itinerary = await fallbackStore.updateItinerary(
      String(req.user._id),
      req.params.itineraryId,
      req.body
    );
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    return res.json(itinerary);
  }

  const user = await User.findById(req.user._id);
  const itinerary = user.itineraryPlans.id(req.params.itineraryId);
  if (!itinerary) {
    return res.status(404).json({ message: "Itinerary not found" });
  }
  itinerary.set(req.body);
  await user.save();
  res.json(itinerary);
};

export const deleteItinerary = async (req, res) => {
  if (!isDatabaseConnected()) {
    const deleted = await fallbackStore.deleteItinerary(String(req.user._id), req.params.itineraryId);
    if (!deleted) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    return res.json({ message: "Itinerary deleted" });
  }

  const user = await User.findById(req.user._id);
  const itinerary = user.itineraryPlans.id(req.params.itineraryId);
  if (!itinerary) {
    return res.status(404).json({ message: "Itinerary not found" });
  }
  itinerary.deleteOne();
  await user.save();
  res.json({ message: "Itinerary deleted" });
};

export const getGuides = async (req, res) => {
  if (!isDatabaseConnected()) {
    const list = await fallbackStore.getGuides(req.query);
    return res.json(list);
  }

  const query = { role: "tour_guide" };
  const searchTerm = req.query.city || req.query.search || req.query.destination;
  if (searchTerm) {
    const pattern = new RegExp(searchTerm, "i");
    query.$or = [
      { name: pattern },
      { city: pattern },
      { state: pattern },
      { bio: pattern },
      { languagesSpoken: pattern }
    ];
  }
  if (req.query.language) {
    query.languagesSpoken = req.query.language;
  }
  if (req.query.maxPrice) {
    query.pricePerDay = { $lte: Number(req.query.maxPrice) };
  }

  const list = await User.find(query).select("-password -refreshTokens");
  res.json(list);
};

export const getGuideById = async (req, res) => {
  if (!isDatabaseConnected()) {
    const guide = await fallbackStore.findUserById(req.params.id);
    if (!guide || guide.role !== "tour_guide") {
      return res.status(404).json({ message: "Tour guide not found" });
    }
    return res.json({ ...guide, reviews: [] });
  }

  const guide = await User.findOne({ _id: req.params.id, role: "tour_guide" }).select("-password -refreshTokens");
  if (!guide) {
    return res.status(404).json({ message: "Tour guide not found" });
  }

  const Review = (await import("../models/Review.js")).default;
  const reviews = await Review.find({ targetId: req.params.id, targetType: "guide" }).populate("user", "name");
  res.json({ ...guide.toObject(), reviews });
};

export const addGuideReview = async (req, res) => {
  if (!isDatabaseConnected()) {
    const guide = await fallbackStore.findUserById(req.params.id);
    if (!guide || guide.role !== "tour_guide") {
      return res.status(404).json({ message: "Tour guide not found" });
    }
    return res.status(201).json(guide);
  }

  const { addReviewToTarget } = await import("./placeHelpers.js");
  return addReviewToTarget({ model: User, targetType: "guide", req, res });
};
