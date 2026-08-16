import express from "express";
import {
  getExploreResults,
  getHighlights,
  getNearbyResults,
  getRecommendations,
  getStreetFoodRecommendations
} from "../controllers/discoverController.js";

const router = express.Router();

router.get("/nearby", getNearbyResults);
router.get("/recommendations", getRecommendations);
router.get("/explore", getExploreResults);
router.get("/highlights", getHighlights);
router.get("/street-food", getStreetFoodRecommendations);

export default router;
