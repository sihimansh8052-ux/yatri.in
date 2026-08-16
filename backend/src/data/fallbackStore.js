import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { busSeeds, hotelSeeds, placeSeeds, restaurantSeeds, trainSeeds } from "./sampleData.js";

const nowIso = () => new Date().toISOString();
const clone = (value) => JSON.parse(JSON.stringify(value));
const makeId = () => new Types.ObjectId().toString();

const demoPasswordHash = bcrypt.hashSync("password123", 10);

const TRAVELER_ID = "680e75b20000000000000091";
const ADMIN_ID = "680e75b20000000000000092";
const ASHA_ID = "680e75b20000000000000021";
const VIKRAM_ID = "680e75b20000000000000022";
const RAJESH_ID = "680e75b20000000000000023";

const state = {
  users: [
    {
      _id: TRAVELER_ID,
      name: "Demo Traveler",
      email: "demo@yatri.in",
      mobile: "+919999999001",
      password: demoPasswordHash,
      role: "traveler",
      country: "India",
      state: "Delhi",
      city: "New Delhi",
      profilePhoto: "",
      provider: "local",
      isEmailVerified: true,
      language: "English",
      preferences: { darkMode: false, emailNotifications: true, smsNotifications: false, pushNotifications: true },
      walletBalance: 2500,
      rewardPoints: 850,
      referralCode: "YATRIDEMO",
      emergencyContacts: [{ name: "Travel Helpdesk", phone: "112", relation: "Emergency" }],
      refreshTokens: [],
      interests: ["food", "culture"],
      savedPlaces: [],
      searchHistory: [],
      itineraryPlans: [],
      notifications: [
        {
          _id: "note-1",
          title: "Welcome to Yatri.in",
          message: "Your luxury travel dashboard is ready.",
          read: false,
          createdAt: nowIso(),
          updatedAt: nowIso()
        }
      ],
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      _id: ADMIN_ID,
      name: "Yatri Admin",
      email: "admin@yatri.in",
      mobile: "+919999999002",
      password: demoPasswordHash,
      role: "admin",
      country: "India",
      state: "Delhi",
      city: "New Delhi",
      profilePhoto: "",
      provider: "local",
      isEmailVerified: true,
      language: "English",
      preferences: { darkMode: false, emailNotifications: true, smsNotifications: false, pushNotifications: true },
      walletBalance: 0,
      rewardPoints: 999,
      referralCode: "YATRIADMIN",
      emergencyContacts: [],
      refreshTokens: [],
      interests: ["culture", "food", "adventure"],
      savedPlaces: [],
      searchHistory: [],
      itineraryPlans: [],
      notifications: [],
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      _id: "680e75b20000000000000093",
      name: "Heritage Stays Partner",
      email: "owner@yatri.in",
      mobile: "+919999999003",
      password: demoPasswordHash,
      role: "hotel_owner",
      country: "India",
      state: "Rajasthan",
      city: "Jaipur",
      profilePhoto: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      provider: "local",
      isEmailVerified: true,
      walletBalance: 148200,
      rewardPoints: 500,
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      _id: ASHA_ID,
      name: "Asha Sharma",
      email: "asha@yatri.in",
      mobile: "+919876543210",
      password: demoPasswordHash,
      role: "tour_guide",
      country: "India",
      state: "Delhi",
      city: "New Delhi",
      profilePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
      experience: 5,
      pricePerDay: 1800,
      languagesSpoken: ["English", "Hindi"],
      rating: 4.9,
      availability: true,
      bio: "Expert in Old Delhi history, food walks, and local hidden markets. I offer heritage and custom photography tours.",
      provider: "local",
      isEmailVerified: true,
      walletBalance: 4200,
      rewardPoints: 120,
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      _id: VIKRAM_ID,
      name: "Vikram Singh",
      email: "vikram@yatri.in",
      mobile: "+919876543211",
      password: demoPasswordHash,
      role: "tour_guide",
      country: "India",
      state: "Rajasthan",
      city: "Jaipur",
      profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      experience: 8,
      pricePerDay: 2500,
      languagesSpoken: ["English", "Hindi", "French"],
      rating: 4.8,
      availability: true,
      bio: "Jaipur native specializing in Royal Palaces, Fort hikes, and traditional Marwari culture. Licensed guide.",
      provider: "local",
      isEmailVerified: true,
      walletBalance: 8900,
      rewardPoints: 340,
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      _id: RAJESH_ID,
      name: "Rajesh Kumar",
      email: "rajesh@yatri.in",
      mobile: "+919876543212",
      password: demoPasswordHash,
      role: "tour_guide",
      country: "India",
      state: "Uttar Pradesh",
      city: "Agra",
      profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      experience: 6,
      pricePerDay: 2000,
      languagesSpoken: ["English", "Hindi", "Spanish"],
      rating: 4.7,
      availability: true,
      bio: "Mughal Architecture and Taj Mahal specialist. I help travelers skip lines and get the best monument photos.",
      provider: "local",
      isEmailVerified: true,
      walletBalance: 3100,
      rewardPoints: 210,
      createdAt: nowIso(),
      updatedAt: nowIso()
    }
  ],
  hotels: hotelSeeds.map((hotel, index) => ({
    _id: `680e75b2000000000000000${index + 1}`,
    ...hotel,
    category: "hotel",
    entityType: "hotel",
    createdAt: nowIso(),
    updatedAt: nowIso()
  })),
  restaurants: restaurantSeeds.map((item, index) => ({
    _id: `680e75b2000000000000001${index + 1}`,
    ...item,
    category: "restaurant",
    entityType: "restaurant",
    createdAt: nowIso(),
    updatedAt: nowIso()
  })),
  places: placeSeeds.map((item, index) => ({
    _id: `680e75b2000000000000003${index + 1}`,
    ...item,
    category: item.category || "attraction",
    entityType: "place",
    createdAt: nowIso(),
    updatedAt: nowIso()
  })),
  flights: [],
  trains: [],
  rooms: hotelSeeds.flatMap((_, index) => {
    const hotelId = `680e75b2000000000000000${index + 1}`;
    return [
      {
        _id: `room-${index + 1}01`,
        hotel: hotelId,
        type: "Standard Room",
        pricePerNight: 2000 + (index * 500),
        capacity: 2,
        beds: 1,
        facilities: ["Free Wi-Fi", "Air Conditioning", "Breakfast Included"],
        images: ["https://images.unsplash.com/photo-1611891487122-2075b9624428"],
        availability: true
      },
      {
        _id: `room-${index + 1}02`,
        hotel: hotelId,
        type: "Deluxe Room",
        pricePerNight: 3500 + (index * 800),
        capacity: 2,
        beds: 1,
        facilities: ["Free Wi-Fi", "Air Conditioning", "Swimming Pool", "Breakfast Included"],
        images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd"],
        availability: true
      },
      {
        _id: `room-${index + 1}03`,
        hotel: hotelId,
        type: "Luxury Suite",
        pricePerNight: 7000 + (index * 1500),
        capacity: 4,
        beds: 2,
        facilities: ["Free Wi-Fi", "Air Conditioning", "Swimming Pool", "Parking", "Breakfast Included"],
        images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a"],
        availability: true
      }
    ];
  }),
  buses: busSeeds.map((bus) => ({
    ...bus,
    createdAt: nowIso(),
    updatedAt: nowIso()
  })),
  trains: trainSeeds.map((train) => ({
    ...train,
    createdAt: nowIso(),
    updatedAt: nowIso()
  })),
  packages: [
    {
      _id: "pkg-401",
      title: "Royal Rajasthan Heritage Experience",
      destination: "Jaipur",
      category: "Family",
      type: "Domestic",
      durationDays: 4,
      durationNights: 3,
      pricePerPerson: 14999,
      inclusions: ["4 Star Heritage Stay", "Private SUV Transit", "Licensed Local Guide", "Buffet Breakfast"],
      itinerary: [
        { day: 1, title: "Arrival & City Palace Walk", description: "Check in at heritage hotel, visit City Palace & Jantar Mantar." },
        { day: 2, title: "Amer Fort & Nahargarh Sunset", description: "Elephant ride at Amer Fort, photography at Jal Mahal, sunset view from Nahargarh." },
        { day: 3, title: "Local Bazaars & Craft Workshop", description: "Explore Johari Bazaar, block printing workshop, dinner at Chokhi Dhani." },
        { day: 4, title: "Albert Hall & Departure", description: "Morning visit to Albert Hall Museum and drop at Airport/Station." }
      ],
      images: ["https://images.unsplash.com/photo-1599661046289-e31897846e41"],
      rating: 4.9
    },
    {
      _id: "pkg-402",
      title: "Kashmir Paradise Valley Tour",
      destination: "Srinagar",
      category: "Honeymoon",
      type: "Domestic",
      durationDays: 5,
      durationNights: 4,
      pricePerPerson: 22999,
      inclusions: ["Dal Lake Houseboat Stay", "Shikara Ride", "Gondola Ride Ticket", "All Meals"],
      itinerary: [
        { day: 1, title: "Srinagar Arrival & Houseboat Stay", description: "Check in to luxury houseboat, evening Shikara ride." },
        { day: 2, title: "Gulmarg Day Trip & Gondola Ride", description: "Scenic drive to Gulmarg, ride phase 1 Gondola cable car." },
        { day: 3, title: "Pahalgam Valley Excursion", description: "Visit Betaab Valley & Aru Valley, riverside picnic." },
        { day: 4, title: "Mughal Gardens Walk", description: "Explore Shalimar Bagh, Nishat Bagh, and local saffron market." },
        { day: 5, title: "Souvenir Shopping & Departure", description: "Morning handicraft shopping and airport transfer." }
      ],
      images: ["https://images.unsplash.com/photo-1598091383021-15ddea10925d"],
      rating: 4.95
    },
    {
      _id: "pkg-403",
      title: "Magical Bali Beach Escape",
      destination: "Bali",
      category: "Honeymoon",
      type: "International",
      durationDays: 6,
      durationNights: 5,
      pricePerPerson: 45999,
      inclusions: ["Luxury Beachfront Villa", "Sunset Catamaran Cruise", "Scuba Diving Session", "Airport Pickup"],
      itinerary: [
        { day: 1, title: "Bali Arrival & Villa Check-in", description: "Private airport reception, flower garland welcome, villa relaxation." },
        { day: 2, title: "Ubud Rice Terraces & Monkey Forest", description: "Visit Tegallalang rice fields, jungle swing experience, Monkey Forest." },
        { day: 3, title: "Nusa Penida Island Tour", description: "Speedboat to Nusa Penida, visit Kelingking T-Rex cliff and Broken Beach." },
        { day: 4, title: "Tanah Lot Temple & Sunset", description: "Water sports at Tanjung Benoa, evening sunset at Tanah Lot sea temple." },
        { day: 5, title: "Balinese Spa & Sunset Cruise", description: "2-hour couple massage treatment followed by luxury evening dinner cruise." },
        { day: 6, title: "Seminyak Shopping & Departure", description: "Boutique shopping in Seminyak before airport transfer." }
      ],
      images: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4"],
      rating: 4.9
    }
  ],
  coupons: [
    {
      _id: "cp-1",
      code: "YATRI10",
      discountPercentage: 10,
      maxDiscount: 1500,
      minBookingAmount: 1000,
      applicableCategory: "all",
      validUntil: "2026-12-31"
    },
    {
      _id: "cp-2",
      code: "FLYHIGH",
      discountPercentage: 15,
      maxDiscount: 2000,
      minBookingAmount: 3000,
      applicableCategory: "flight",
      validUntil: "2026-12-31"
    },
    {
      _id: "cp-3",
      code: "STAYWELCOME",
      discountPercentage: 20,
      maxDiscount: 2500,
      minBookingAmount: 2000,
      applicableCategory: "hotel",
      validUntil: "2026-12-31"
    }
  ],
  bookings: [
    {
      _id: "HB-1042",
      user: TRAVELER_ID,
      bookingType: "hotel",
      hotel: "680e75b20000000000000001",
      checkIn: "2026-08-14T12:00:00.000Z",
      checkOut: "2026-08-16T11:00:00.000Z",
      guests: 2,
      status: "confirmed",
      totalPrice: 4200,
      paymentId: "pay_mock_1042",
      paymentStatus: "success",
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      _id: "HB-1048",
      user: TRAVELER_ID,
      bookingType: "hotel",
      hotel: "680e75b20000000000000002",
      checkIn: "2026-09-02T12:00:00.000Z",
      checkOut: "2026-09-04T11:00:00.000Z",
      guests: 1,
      status: "pending",
      totalPrice: 8600,
      paymentId: "pay_mock_1048",
      paymentStatus: "pending",
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    {
      _id: "GB-2201",
      user: TRAVELER_ID,
      bookingType: "guide",
      guide: ASHA_ID,
      date: "2026-08-15T09:00:00.000Z",
      durationDays: 1,
      guests: 2,
      status: "confirmed",
      totalPrice: 1800,
      paymentId: "pay_mock_2201",
      paymentStatus: "success",
      createdAt: nowIso(),
      updatedAt: nowIso()
    }
  ],
  messages: [
    {
      _id: "msg-101",
      sender: TRAVELER_ID,
      receiver: ASHA_ID,
      text: "Hello Asha! I booked your Old Delhi tour for Aug 15. Where do we meet?",
      createdAt: nowIso()
    },
    {
      _id: "msg-102",
      sender: ASHA_ID,
      receiver: TRAVELER_ID,
      text: "Hi! We will meet near Gate 2 at Chandni Chowk Metro Station at 9:00 AM.",
      createdAt: nowIso()
    }
  ]
};

const sanitizeUser = (user) => {
  const copy = clone(user);
  delete copy.password;
  delete copy.refreshTokens;
  delete copy.emailOtp;
  delete copy.mobileOtp;
  delete copy.resetPasswordToken;
  return copy;
};

export const fallbackStore = {
  findUserByEmail(email) {
    const user = state.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    return user ? clone(user) : null;
  },
  findUserByCredential(credential) {
    const value = String(credential || "").trim().toLowerCase();
    const user = state.users.find((item) => item.email.toLowerCase() === value || item.mobile === credential);
    return user ? clone(user) : null;
  },
  findUserById(id) {
    const user = state.users.find((item) => item._id === id);
    return user ? clone(user) : null;
  },
  comparePassword(user, plainPassword) {
    if (!user || !user.password) return false;
    return bcrypt.compareSync(plainPassword, user.password);
  },
  addRefreshToken(userId, hashedToken, expiresAt) {
    const user = state.users.find((u) => u._id === userId);
    if (user) {
      if (!user.refreshTokens) user.refreshTokens = [];
      user.refreshTokens.push({ token: hashedToken, expiresAt });
    }
  },
  removeRefreshToken(userId, hashedToken) {
    const user = state.users.find((u) => u._id === userId);
    if (user && user.refreshTokens) {
      user.refreshTokens = user.refreshTokens.filter((t) => t.token !== hashedToken);
    }
  },
  hasRefreshToken(userId, hashedToken) {
    const user = state.users.find((u) => u._id === userId);
    if (!user || !user.refreshTokens) return false;
    return user.refreshTokens.some((t) => t.token === hashedToken);
  },
  findUserByResetToken(hashedToken) {
    const user = state.users.find((u) => u.resetPasswordToken === hashedToken && new Date(u.resetPasswordExpires).getTime() > Date.now());
    return user ? clone(user) : null;
  },
  setPassword(userId, newPassword) {
    const user = state.users.find((u) => u._id === userId);
    if (user) {
      user.password = bcrypt.hashSync(newPassword, 10);
      user.updatedAt = nowIso();
    }
  },
  createUser(payload) {
    const user = {
      _id: makeId(),
      ...payload,
      password: bcrypt.hashSync(payload.password, 10),
      role: payload.role || "traveler",
      savedPlaces: [],
      searchHistory: [],
      itineraryPlans: [],
      notifications: [],
      walletBalance: 500,
      rewardPoints: 100,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    state.users.push(user);
    return sanitizeUser(user);
  },
  updateUser(id, updates) {
    const user = state.users.find((item) => item._id === id);
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: nowIso() });
    return sanitizeUser(user);
  },
  saveUserPatch(id, updates) {
    return this.updateUser(id, updates);
  },
  updateUserRole(id, role) {
    const user = state.users.find((item) => item._id === id);
    if (!user) return null;
    user.role = role;
    user.updatedAt = nowIso();
    return sanitizeUser(user);
  },
  deleteUser(id) {
    const index = state.users.findIndex((item) => item._id === id);
    if (index === -1) return false;
    state.users.splice(index, 1);
    return true;
  },
  getAllUsers() {
    return state.users.map(sanitizeUser);
  },
  getHotels() {
    return clone(state.hotels);
  },
  getRestaurants() {
    return clone(state.restaurants);
  },
  getPlaces() {
    return clone(state.places);
  },
  getGuides() {
    return state.users.filter((u) => u.role === "tour_guide").map(sanitizeUser);
  },
  getBuses(query = {}) {
    let list = clone(state.buses);
    if (query.from) {
      const from = query.from.toLowerCase();
      list = list.filter((b) =>
        b.from.toLowerCase().includes(from) ||
        b.boardingPoints?.some((point) => point.toLowerCase().includes(from))
      );
    }
    if (query.to) {
      const to = query.to.toLowerCase();
      list = list.filter((b) =>
        b.to.toLowerCase().includes(to) ||
        b.droppingPoints?.some((point) => point.toLowerCase().includes(to))
      );
    }
    return list;
  },
  getTrains(query = {}) {
    let list = clone(state.trains);
    if (query.from) {
      const from = query.from.toLowerCase();
      list = list.filter((train) =>
        train.from.toLowerCase().includes(from) ||
        train.boardingStations?.some((station) => station.toLowerCase().includes(from))
      );
    }
    if (query.to) {
      const to = query.to.toLowerCase();
      list = list.filter((train) =>
        train.to.toLowerCase().includes(to) ||
        train.droppingStations?.some((station) => station.toLowerCase().includes(to))
      );
    }
    return list;
  },
  getPackages(query = {}) {
    let list = clone(state.packages);
    if (query.category && query.category !== "all") {
      list = list.filter((p) => p.category.toLowerCase() === query.category.toLowerCase());
    }
    if (query.type && query.type !== "all") {
      list = list.filter((p) => p.type.toLowerCase() === query.type.toLowerCase());
    }
    const text = String(query.destination || query.search || "").trim().toLowerCase();
    if (text) {
      list = list.filter((p) =>
        p.destination?.toLowerCase().includes(text) ||
        p.title?.toLowerCase().includes(text) ||
        p.overview?.toLowerCase().includes(text) ||
        p.highlights?.some((item) => item.toLowerCase().includes(text)) ||
        p.bestFor?.some((item) => item.toLowerCase().includes(text))
      );
    }
    return list;
  },
  getCoupons() {
    return clone(state.coupons);
  },
  applyCoupon(code, amount) {
    const coupon = state.coupons.find((c) => c.code === code.toUpperCase());
    if (!coupon) return { valid: false, message: "Invalid coupon code" };
    if (amount < coupon.minBookingAmount) {
      return { valid: false, message: `Minimum booking amount for this coupon is Rs. ${coupon.minBookingAmount}` };
    }
    const discount = Math.min((amount * coupon.discountPercentage) / 100, coupon.maxDiscount);
    return { valid: true, discount, finalAmount: amount - discount, code: coupon.code };
  },
  getCollection(type) {
    const key = type.endsWith("s") ? type : `${type}s`;
    if (key === "hotels") return state.hotels;
    if (key === "restaurants") return state.restaurants;
    if (key === "places") return state.places;
    if (key === "buses") return state.buses;
    if (key === "trains") return state.trains;
    if (key === "packages") return state.packages;
    if (key === "rooms") return state.rooms;
    return state.hotels;
  },
  findListingById(type, id) {
    const collection = this.getCollection(type);
    const item = collection.find((x) => x._id === id);
    return item ? clone(item) : null;
  },
  createListing(type, payload) {
    const collection = this.getCollection(type);
    const item = {
      _id: makeId(),
      ...payload,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    collection.unshift(item);
    return clone(item);
  },
  updateListing(type, id, updates) {
    const collection = this.getCollection(type);
    const item = collection.find((x) => x._id === id);
    if (!item) return null;
    Object.assign(item, updates, { updatedAt: nowIso() });
    return clone(item);
  },
  deleteListing(type, id) {
    const collection = this.getCollection(type);
    const index = collection.findIndex((item) => item._id === id);
    if (index === -1) return false;
    collection.splice(index, 1);
    return true;
  },
  findHotelById(id) {
    return clone(state.hotels.find((item) => item._id === id) || null);
  },
  createBooking(payload) {
    const booking = {
      _id: `B-${Math.floor(1000 + Math.random() * 9000)}`,
      user: payload.userId,
      bookingType: payload.bookingType || "hotel",
      hotel: payload.hotelId,
      guide: payload.guideId,
      bus: payload.busId,
      train: payload.trainId,
      package: payload.packageId,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      date: payload.date,
      durationDays: payload.durationDays,
      seatNumber: payload.seatNumber,
      classType: payload.classType,
      boardingPoint: payload.boardingPoint,
      droppingPoint: payload.droppingPoint,
      hotelName: payload.hotelName,
      roomType: payload.roomType,
      passengerName: payload.passengerName,
      pnrNumber: payload.pnrNumber,
      guests: payload.guests || 1,
      status: "confirmed",
      totalPrice: payload.totalPrice,
      paymentId: payload.paymentId || `pay_mock_${makeId().slice(-6)}`,
      paymentStatus: "success",
      baseAmount: payload.baseAmount,
      commissionRate: payload.commissionRate,
      commissionAmount: payload.commissionAmount,
      platformFee: payload.platformFee,
      platformRevenue: payload.platformRevenue,
      partnerPayout: payload.partnerPayout,
      revenueModel: payload.revenueModel,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    state.bookings.unshift(booking);
    return clone(booking);
  },
  getBookings(userId) {
    const list = state.bookings.filter((booking) => booking.user === userId);
    return list.map((booking) => {
      const copy = clone(booking);
      if (copy.bookingType === "hotel" && copy.hotel) {
        copy.hotel = this.findHotelById(copy.hotel);
      } else if (copy.bookingType === "guide" && copy.guide) {
        const guideUser = state.users.find((u) => u._id === copy.guide);
        copy.guide = guideUser ? sanitizeUser(guideUser) : null;
      } else if (copy.bookingType === "bus" && copy.bus) {
        copy.bus = state.buses.find((b) => b._id === copy.bus);
      } else if (copy.bookingType === "train" && copy.train) {
        copy.train = state.trains.find((t) => t._id === copy.train);
      } else if (copy.bookingType === "package" && copy.package) {
        copy.package = state.packages.find((p) => p._id === copy.package);
      }
      return copy;
    });
  },
  getAllBookings() {
    return state.bookings.map((booking) => {
      const copy = clone(booking);
      if (copy.bookingType === "hotel" && copy.hotel) {
        copy.hotel = this.findHotelById(copy.hotel);
      } else if (copy.bookingType === "guide" && copy.guide) {
        const guideUser = state.users.find((u) => u._id === copy.guide);
        copy.guide = guideUser ? sanitizeUser(guideUser) : null;
      } else if (copy.bookingType === "bus" && copy.bus) {
        copy.bus = state.buses.find((b) => b._id === copy.bus);
      } else if (copy.bookingType === "train" && copy.train) {
        copy.train = state.trains.find((t) => t._id === copy.train);
      }
      const buyer = state.users.find((u) => u._id === copy.user);
      copy.user = buyer ? sanitizeUser(buyer) : null;
      return copy;
    });
  },
  updateBookingStatus(userId, bookingId, status) {
    const booking = state.bookings.find((item) => item._id === bookingId);
    if (!booking) return null;
    booking.status = status;
    booking.updatedAt = nowIso();
    return clone(booking);
  },
  adminDeleteBooking(bookingId) {
    const index = state.bookings.findIndex((item) => item._id === bookingId);
    if (index === -1) return false;
    state.bookings.splice(index, 1);
    return true;
  },
  async getMessages(userId) {
    return clone(state.messages.filter((msg) => msg.sender === userId || msg.receiver === userId));
  },
  async sendMessage(senderId, receiverId, text) {
    const msg = {
      _id: makeId(),
      sender: senderId,
      receiver: receiverId,
      text,
      createdAt: nowIso()
    };
    state.messages.push(msg);

    const receiverUser = state.users.find((u) => u._id === receiverId);
    if (receiverUser && receiverUser.role === "tour_guide" && senderId === TRAVELER_ID) {
      setTimeout(() => {
        state.messages.push({
          _id: makeId(),
          sender: receiverId,
          receiver: senderId,
          text: `Hi there! I am ${receiverUser.name}. Thank you for contacting me. I am indeed available in ${receiverUser.city} and would be delighted to guide you! Let's arrange our tour schedule.`,
          createdAt: nowIso()
        });
      }, 1500);
    }

    return clone(msg);
  }
};
