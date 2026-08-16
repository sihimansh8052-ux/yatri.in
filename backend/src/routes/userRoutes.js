import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addSearchHistory,
  changePassword,
  createItinerary,
  deleteItinerary,
  deleteAccount,
  getDashboard,
  getNotifications,
  removeSavedPlace,
  savePlace,
  updateItinerary,
  updateProfile,
  getGuides,
  getGuideById,
  addGuideReview
} from "../controllers/userController.js";

const router = express.Router();

router.get("/guides", getGuides);
router.get("/guides/:id", getGuideById);
router.use(protect);
router.post("/guides/:id/reviews", addGuideReview);

router.get("/dashboard", getDashboard);
router.patch("/profile", updateProfile);
router.patch("/change-password", changePassword);
router.delete("/account", deleteAccount);
router.post("/saved", savePlace);
router.delete("/saved", removeSavedPlace);
router.post("/history", addSearchHistory);
router.get("/notifications", getNotifications);
router.post("/itinerary", createItinerary);
router.put("/itinerary/:itineraryId", updateItinerary);
router.delete("/itinerary/:itineraryId", deleteItinerary);

export default router;
