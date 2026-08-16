import express from "express";
import { createBooking, getBookings, updateBookingStatus, verifyPayment } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getBookings).post(createBooking);
router.post("/verify", verifyPayment);
router.patch("/:id/status", updateBookingStatus);

export default router;
