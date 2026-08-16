import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = isDatabaseConnected()
      ? await User.findById(decoded.id).select("-password")
      : await fallbackStore.findUserById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalid" });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  const normalizedRole = req.user?.role === "user" ? "traveler" : req.user?.role;
  if (!roles.includes(normalizedRole)) {
    return res.status(403).json({ message: "You do not have permission to access this resource" });
  }
  next();
};
