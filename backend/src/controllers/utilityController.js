import Coupon from "../models/Coupon.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";
import { generatePlanFromAI } from "../services/aiService.js";

export const generateAiItinerary = async (req, res) => {
  try {
    const plan = await generatePlanFromAI(req.body);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate AI itinerary", detail: error.message });
  }
};

export const getNearbyEmergencyServices = async (req, res) => {
  try {
    const { lat = 28.6139, lng = 77.209, serviceType = "hospital" } = req.query;
    const mockServices = [
      {
        _id: "em-1",
        name: `City ${serviceType.toUpperCase()} Center`,
        category: serviceType,
        address: "Main Sector Road, Block A",
        phone: "+91 11 2345 6789",
        distanceKm: 1.2,
        location: { coordinates: [Number(lng) + 0.01, Number(lat) + 0.01] }
      },
      {
        _id: "em-2",
        name: `Metro Emergency ${serviceType.toUpperCase()}`,
        category: serviceType,
        address: "Station Outer Circle",
        phone: "112",
        distanceKm: 2.5,
        location: { coordinates: [Number(lng) - 0.01, Number(lat) - 0.01] }
      }
    ];
    res.json(mockServices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch nearby services" });
  }
};

export const getCoupons = async (_req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.json(fallbackStore.getCoupons());
    }
    const coupons = await Coupon.find({ validUntil: { $gte: new Date() } });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!isDatabaseConnected()) {
      const result = fallbackStore.applyCoupon(code, Number(amount));
      return res.json(result);
    }
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(400).json({ valid: false, message: "Invalid coupon code" });
    if (Number(amount) < coupon.minBookingAmount) {
      return res.status(400).json({ valid: false, message: `Minimum booking amount is Rs. ${coupon.minBookingAmount}` });
    }
    const discount = Math.min((Number(amount) * coupon.discountPercentage) / 100, coupon.maxDiscount);
    res.json({ valid: true, discount, finalAmount: Number(amount) - discount, code: coupon.code });
  } catch (error) {
    res.status(500).json({ message: "Failed to apply coupon" });
  }
};

export const getWeather = async (req, res) => {
  try {
    const city = req.query.city || "New Delhi";
    res.json({
      city,
      temp: "32°C",
      condition: "Sunny & Pleasant",
      humidity: "45%",
      wind: "12 km/h",
      forecast: [
        { day: "Today", temp: "32°C", condition: "Sunny" },
        { day: "Tomorrow", temp: "30°C", condition: "Partly Cloudy" },
        { day: "Day 3", temp: "28°C", condition: "Light Rain" }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch weather" });
  }
};
