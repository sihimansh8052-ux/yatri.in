import crypto from "crypto";
import User from "../models/User.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";
import { generateRefreshToken, generateToken, verifyRefreshToken } from "../utils/generateToken.js";

const refreshCookieName = "yatri_refresh";

const normalizeRole = (role) => (role === "user" ? "traveler" : role || "traveler");
const oneTimeCode = () => String(Math.floor(100000 + Math.random() * 900000));
const hashValue = (value) => crypto.createHash("sha256").update(value).digest("hex");

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: normalizeRole(user.role),
  country: user.country,
  state: user.state,
  city: user.city,
  profilePhoto: user.profilePhoto,
  provider: user.provider || "local",
  isEmailVerified: Boolean(user.isEmailVerified),
  language: user.language || "English",
  preferences: user.preferences || {},
  emergencyContacts: user.emergencyContacts || [],
  walletBalance: user.walletBalance || 0,
  rewardPoints: user.rewardPoints || 0,
  referralCode: user.referralCode,
  interests: user.interests || [],
  savedPlaces: user.savedPlaces || [],
  searchHistory: user.searchHistory || [],
  itineraryPlans: user.itineraryPlans || [],
  notifications: user.notifications || []
});

const setRefreshCookie = (res, token, rememberMe = false) => {
  res.cookie(refreshCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  });
};

const readRefreshCookie = (req) =>
  req.headers.cookie
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${refreshCookieName}=`))
    ?.split("=")[1];

const authPayload = async (user, res, rememberMe = false) => {
  const refreshToken = generateRefreshToken(user._id);
  const accessToken = generateToken(user._id, normalizeRole(user.role));
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (isDatabaseConnected()) {
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: { token: hashValue(refreshToken), expiresAt } }
    });
  } else {
    await fallbackStore.addRefreshToken(String(user._id), hashValue(refreshToken), expiresAt.toISOString());
  }

  setRefreshCookie(res, refreshToken, rememberMe);
  return { ...publicUser(user), token: accessToken, refreshToken };
};

const findUserByEmail = async (email) =>
  isDatabaseConnected() ? User.findOne({ email }) : fallbackStore.findUserByEmail(email);

const findUserByCredential = async (credential) => {
  const value = String(credential || "").trim();
  const normalized = value.toLowerCase();
  if (!value) return null;
  return isDatabaseConnected()
    ? User.findOne({ $or: [{ email: normalized }, { mobile: value }] })
    : fallbackStore.findUserByCredential(value);
};

const findUserById = async (id) =>
  isDatabaseConnected() ? User.findById(id).select("-password") : fallbackStore.findUserById(id);

const fallbackDemoProfiles = {
  "demo@yatri.in": {
    name: "Demo Traveler",
    email: "demo@yatri.in",
    mobile: "+919999999001",
    password: "password123",
    role: "traveler",
    country: "India",
    state: "Delhi",
    city: "New Delhi",
    isEmailVerified: true
  },
  "admin@yatri.in": {
    name: "Yatri Admin",
    email: "admin@yatri.in",
    mobile: "+919999999002",
    password: "password123",
    role: "admin",
    country: "India",
    state: "Delhi",
    city: "New Delhi",
    isEmailVerified: true
  },
  "asha@yatri.in": {
    name: "Asha Sharma",
    email: "asha@yatri.in",
    mobile: "+919876543210",
    password: "password123",
    role: "tour_guide",
    country: "India",
    state: "Delhi",
    city: "New Delhi",
    isEmailVerified: true
  },
  "owner@yatri.in": {
    name: "Heritage Stays Partner",
    email: "owner@yatri.in",
    mobile: "+919999999003",
    password: "password123",
    role: "hotel_owner",
    country: "India",
    state: "Rajasthan",
    city: "Jaipur",
    isEmailVerified: true
  }
};

const getFallbackDemoUser = async (credential, password) => {
  if (isDatabaseConnected() || password !== "password123") return null;
  const email = String(credential || "").trim().toLowerCase();
  const demo = fallbackDemoProfiles[email];
  if (!demo) return null;
  return fallbackStore.findUserByEmail(email) || fallbackStore.createUser(demo);
};

export const signup = async (req, res) => {
  try {
    const {
      name,
      fullName,
      email,
      mobile,
      password,
      confirmPassword,
      country,
      state,
      city,
      profilePhoto,
      role = "traveler",
      rememberMe = true
    } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();
    const finalName = (fullName || name)?.trim();
    const safeRole = ["traveler", "tour_guide", "hotel_owner"].includes(role) ? role : "traveler";

    if (!finalName || !normalizedEmail || !mobile || !password || !confirmPassword || !country || !state || !city) {
      return res.status(400).json({ message: "Please complete all required registration fields" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const otp = oneTimeCode();
    const userData = {
      name: finalName,
      email: normalizedEmail,
      mobile,
      password,
      role: safeRole,
      country,
      state,
      city,
      profilePhoto,
      isEmailVerified: false,
      emailOtp: hashValue(otp),
      emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
      referralCode: `YATRI${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      notifications: [
        {
          title: "Welcome to Yatri.in",
          message: "Verify your email to unlock all dashboard features."
        }
      ]
    };

    const user = isDatabaseConnected() ? await User.create(userData) : await fallbackStore.createUser(userData);
    const payload = await authPayload(user, res, rememberMe);
    res.status(201).json({ ...payload, devOtp: process.env.NODE_ENV === "production" ? undefined : otp });
  } catch (error) {
    console.error("Signup failed", error);
    res.status(500).json({ message: error.code === 11000 ? "Email already in use" : "Unable to create account" });
  }
};

export const login = async (req, res) => {
  try {
    const credential = req.body.email || req.body.identifier || req.body.mobile;
    const { password, rememberMe = false } = req.body;
    let user = await findUserByCredential(credential);

    let validPassword = isDatabaseConnected()
      ? user && (await user.matchPassword(password))
      : user && (await fallbackStore.comparePassword(user, password));

    if (!validPassword) {
      const fallbackDemoUser = await getFallbackDemoUser(credential, password);
      if (fallbackDemoUser) {
        user = fallbackDemoUser;
        validPassword = true;
      }
    }

    if (!user || !validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json(await authPayload(user, res, rememberMe));
  } catch (_error) {
    res.status(500).json({ message: "Unable to login right now" });
  }
};

export const googleSignIn = async (req, res) => {
  try {
    const { email, name, picture, googleId, role = "traveler", rememberMe = true } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !name) {
      return res.status(400).json({ message: "Google profile email and name are required" });
    }

    let user = await findUserByEmail(normalizedEmail);
    if (!user) {
      const password = crypto.randomBytes(18).toString("hex");
      const userData = {
        name,
        email: normalizedEmail,
        mobile: "",
        password,
        role,
        profilePhoto: picture,
        provider: "google",
        googleId,
        isEmailVerified: true,
        referralCode: `YATRI${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      };
      user = isDatabaseConnected() ? await User.create(userData) : await fallbackStore.createUser(userData);
    }

    res.json(await authPayload(user, res, rememberMe));
  } catch (_error) {
    res.status(500).json({ message: "Google sign in failed" });
  }
};

export const gitHubSignIn = async (req, res) => {
  try {
    const { email, name, avatarUrl, githubId, role = "traveler", rememberMe = true } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !name) {
      return res.status(400).json({ message: "GitHub profile email and name are required" });
    }

    let user = await findUserByEmail(normalizedEmail);
    if (!user) {
      const password = crypto.randomBytes(18).toString("hex");
      const userData = {
        name,
        email: normalizedEmail,
        mobile: "",
        password,
        role,
        profilePhoto: avatarUrl,
        provider: "github",
        githubId,
        isEmailVerified: true,
        referralCode: `YATRI${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      };
      user = isDatabaseConnected() ? await User.create(userData) : await fallbackStore.createUser(userData);
    }

    res.json(await authPayload(user, res, rememberMe));
  } catch (_error) {
    console.error("GitHub sign in failed", _error);
    res.status(500).json({ message: "GitHub sign in failed" });
  }
};

export const requestEmailOtp = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const user = await findUserByEmail(email);
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = oneTimeCode();
  const patch = {
    emailOtp: hashValue(otp),
    emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000)
  };

  if (isDatabaseConnected()) await User.findByIdAndUpdate(user._id, patch);
  else await fallbackStore.saveUserPatch(String(user._id), { ...patch, emailOtpExpires: patch.emailOtpExpires.toISOString() });

  res.json({ message: "OTP sent to email", devOtp: process.env.NODE_ENV === "production" ? undefined : otp });
};

export const verifyEmailOtp = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { otp } = req.body;
  const user = await findUserByEmail(email);

  if (!user || user.emailOtp !== hashValue(String(otp)) || new Date(user.emailOtpExpires).getTime() < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const patch = { isEmailVerified: true, emailOtp: undefined, emailOtpExpires: undefined };
  if (isDatabaseConnected()) await User.findByIdAndUpdate(user._id, patch);
  else await fallbackStore.saveUserPatch(String(user._id), patch);

  res.json({ message: "Email verified successfully" });
};

export const requestMobileOtp = async (req, res) => {
  const { mobile } = req.body;
  const otp = oneTimeCode();
  res.json({ message: `OTP sent to ${mobile}`, devOtp: process.env.NODE_ENV === "production" ? undefined : otp });
};

export const forgotPassword = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const user = await findUserByEmail(email);
  if (!user) return res.json({ message: "If the email exists, reset instructions have been sent" });

  const rawToken = crypto.randomBytes(24).toString("hex");
  const patch = {
    resetPasswordToken: hashValue(rawToken),
    resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000)
  };

  if (isDatabaseConnected()) await User.findByIdAndUpdate(user._id, patch);
  else await fallbackStore.saveUserPatch(String(user._id), { ...patch, resetPasswordExpires: patch.resetPasswordExpires.toISOString() });

  res.json({
    message: "Password reset token generated",
    resetToken: process.env.NODE_ENV === "production" ? undefined : rawToken
  });
};

export const resetPassword = async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  if (!token || !password || password !== confirmPassword) {
    return res.status(400).json({ message: "Valid token and matching passwords are required" });
  }

  const hashedToken = hashValue(token);
  const user = isDatabaseConnected()
    ? await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: new Date() } })
    : await fallbackStore.findUserByResetToken(hashedToken);

  if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

  if (isDatabaseConnected()) {
    const dbUser = await User.findById(user._id);
    dbUser.password = password;
    dbUser.resetPasswordToken = undefined;
    dbUser.resetPasswordExpires = undefined;
    await dbUser.save();
  } else {
    await fallbackStore.setPassword(String(user._id), password);
    await fallbackStore.saveUserPatch(String(user._id), { resetPasswordToken: undefined, resetPasswordExpires: undefined });
  }

  res.json({ message: "Password reset successfully" });
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = readRefreshCookie(req) || req.body.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token missing" });

    const decoded = verifyRefreshToken(refreshToken);
    const user = await findUserById(decoded.id);
    const hashed = hashValue(refreshToken);
    const valid = isDatabaseConnected()
      ? await User.exists({ _id: decoded.id, "refreshTokens.token": hashed, "refreshTokens.expiresAt": { $gt: new Date() } })
      : await fallbackStore.hasRefreshToken(decoded.id, hashed);

    if (!user || !valid) return res.status(401).json({ message: "Refresh token invalid" });
    res.json({ ...publicUser(user), token: generateToken(user._id, normalizeRole(user.role)) });
  } catch (_error) {
    res.status(401).json({ message: "Refresh token expired" });
  }
};

export const logout = async (req, res) => {
  const refreshToken = readRefreshCookie(req) || req.body.refreshToken;
  if (refreshToken) {
    const hashed = hashValue(refreshToken);
    if (isDatabaseConnected()) {
      await User.updateOne({ "refreshTokens.token": hashed }, { $pull: { refreshTokens: { token: hashed } } });
    } else {
      await fallbackStore.removeRefreshToken(hashed);
    }
  }
  res.clearCookie(refreshCookieName);
  res.json({ message: "Logged out successfully" });
};

export const me = async (req, res) => {
  const user = await findUserById(req.user._id);
  res.json(publicUser(user));
};
