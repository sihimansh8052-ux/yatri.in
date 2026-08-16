import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB, isDatabaseConnected } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import hotelRoutes from "./src/routes/hotelRoutes.js";
import roomRoutes from "./src/routes/roomRoutes.js";
import restaurantRoutes from "./src/routes/restaurantRoutes.js";
import placeRoutes from "./src/routes/placeRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import discoverRoutes from "./src/routes/discoverRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import busRoutes from "./src/routes/busRoutes.js";
import trainRoutes from "./src/routes/trainRoutes.js";
import packageRoutes from "./src/routes/packageRoutes.js";
import utilityRoutes from "./src/routes/utilityRoutes.js";
import { ensureSeedData } from "./src/data/ensureSeedData.js";
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";
import { csrfProtection, rateLimit, sanitizeInput, securityHeaders } from "./src/middleware/securityMiddleware.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const clientUrls = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (clientUrls.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".vercel.app");
  } catch (_error) {
    return false;
  }
};

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(securityHeaders);
app.use(rateLimit());
app.use(sanitizeInput);
app.use(csrfProtection);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Yatri.in API",
    database: isDatabaseConnected() ? "connected" : "fallback"
  });
});

app.post("/api/log-error", (req, res) => {
  console.error("====== CLIENT-SIDE REACT CRASH ======");
  console.error(req.body);
  console.error("=====================================");
  res.sendStatus(200);
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/hotels/:hotelId/rooms", roomRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/trains", trainRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/utility", utilityRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, async () => {
  console.log(`Yatri.in backend running on port ${port}`);
  const connected = await connectDB();
  if (connected) await ensureSeedData();
});
