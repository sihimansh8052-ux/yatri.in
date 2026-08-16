import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const savedPlaceSchema = new mongoose.Schema(
  {
    placeId: { type: String, required: true },
    placeType: { type: String, enum: ["hotel", "restaurant", "place"], required: true }
  },
  { _id: false }
);

const itinerarySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    startDate: String,
    endDate: String,
    days: [
      {
        dayLabel: String,
        notes: String,
        items: [
          {
            placeId: String,
            placeType: String,
            name: String,
            time: String
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const tokenSchema = new mongoose.Schema(
  {
    token: String,
    expiresAt: Date,
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["traveler", "tour_guide", "hotel_owner", "admin", "user"],
      default: "traveler"
    },
    country: String,
    state: String,
    city: String,
    profilePhoto: String,
    experience: Number,
    pricePerDay: Number,
    languagesSpoken: [{ type: String }],
    rating: { type: Number, default: 4.5 },
    availability: { type: Boolean, default: true },
    bio: String,
    provider: { type: String, enum: ["local", "google", "github"], default: "local" },
    googleId: String,
    isEmailVerified: { type: Boolean, default: false },
    emailOtp: String,
    emailOtpExpires: Date,
    mobileOtp: String,
    mobileOtpExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshTokens: [tokenSchema],
    language: { type: String, default: "English" },
    preferences: {
      darkMode: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: true }
    },
    walletBalance: { type: Number, default: 0 },
    rewardPoints: { type: Number, default: 250 },
    referralCode: String,
    emergencyContacts: [
      {
        name: String,
        phone: String,
        relation: String
      }
    ],
    interests: [{ type: String }],
    savedPlaces: [savedPlaceSchema],
    searchHistory: [{ query: String, createdAt: { type: Date, default: Date.now } }],
    itineraryPlans: [itinerarySchema],
    notifications: [notificationSchema]
  },
  { timestamps: true }
);

userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
