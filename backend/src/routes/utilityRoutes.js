import express from "express";
import {
  generateAiItinerary,
  getNearbyEmergencyServices,
  getCoupons,
  applyCoupon,
  getWeather
} from "../controllers/utilityController.js";
import { getAssistantResponse } from "../controllers/assistantController.js";

const router = express.Router();

router.post("/ai-assistant", getAssistantResponse);

router.post("/ai-planner", generateAiItinerary);
router.get("/nearby-services", getNearbyEmergencyServices);
router.get("/coupons", getCoupons);
router.post("/apply-coupon", applyCoupon);
router.get("/weather", getWeather);

export default router;
