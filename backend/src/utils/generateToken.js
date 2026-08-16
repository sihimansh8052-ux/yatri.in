import jwt from "jsonwebtoken";

export const generateToken = (id, role = "traveler") =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "15m" });

export const generateRefreshToken = (id) =>
  jwt.sign({ id, type: "refresh" }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "dev_secret", {
    expiresIn: "7d"
  });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "dev_secret");
