import express from "express";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import {
  addHotelReview,
  createHotel,
  deleteHotel,
  getHotelById,
  getHotels,
  updateHotel
} from "../controllers/hotelController.js";

const router = express.Router();

router.route("/").get(getHotels).post(protect, adminOnly, createHotel);
router.route("/:id").get(getHotelById).put(protect, adminOnly, updateHotel).delete(protect, adminOnly, deleteHotel);
router.post("/:id/reviews", protect, addHotelReview);

export default router;
