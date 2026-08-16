import express from "express";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import {
  addPlaceReview,
  createPlace,
  deletePlace,
  getPlaceById,
  getPlaces,
  updatePlace
} from "../controllers/placeController.js";

const router = express.Router();

router.route("/").get(getPlaces).post(protect, adminOnly, createPlace);
router.route("/:id").get(getPlaceById).put(protect, adminOnly, updatePlace).delete(protect, adminOnly, deletePlace);
router.post("/:id/reviews", protect, addPlaceReview);

export default router;
