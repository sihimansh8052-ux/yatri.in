import express from "express";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import {
  addRestaurantReview,
  createRestaurant,
  deleteRestaurant,
  getRestaurantById,
  getRestaurants,
  updateRestaurant
} from "../controllers/restaurantController.js";

const router = express.Router();

router.route("/").get(getRestaurants).post(protect, adminOnly, createRestaurant);
router.route("/:id").get(getRestaurantById).put(protect, adminOnly, updateRestaurant).delete(protect, adminOnly, deleteRestaurant);
router.post("/:id/reviews", protect, addRestaurantReview);

export default router;
