import Restaurant from "../models/Restaurant.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";
import { googleGetPlaceDetails, googleSearchByCategory, hasGooglePlacesApi } from "../services/googlePlacesService.js";
import { addReviewToTarget, filterByCommonQuery, getItemWithReviews } from "./placeHelpers.js";

const isMongoId = (value) => /^[a-fA-F0-9]{24}$/.test(value);

export const getRestaurants = async (req, res) => {
  if (hasGooglePlacesApi() && (req.query.city || req.query.search || (req.query.lat && req.query.lng))) {
    try {
      const restaurants = await googleSearchByCategory({ category: "restaurant", ...req.query, limit: 12 });
      return res.json(restaurants);
    } catch (error) {
      console.warn("Google restaurant search failed, falling back to local database:", error.message);
    }
  }
  const restaurants = isDatabaseConnected()
    ? await Restaurant.find().sort({ createdAt: -1 })
    : fallbackStore.getRestaurants();
  res.json(filterByCommonQuery(restaurants, req.query));
};

export const getRestaurantById = async (req, res) => {
  if (hasGooglePlacesApi() && !isMongoId(req.params.id)) {
    try {
      const restaurant = await googleGetPlaceDetails(req.params.id, "restaurant");
      return res.json(restaurant);
    } catch (_error) {}
  }
  if (!isDatabaseConnected()) {
    const restaurant = fallbackStore.findListingById("restaurant", req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    return res.json({ ...restaurant, reviews: [] });
  }
  const restaurant = await getItemWithReviews(Restaurant, "restaurant", req.params.id);
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
  res.json(restaurant);
};

export const createRestaurant = async (req, res) => {
  if (!isDatabaseConnected()) {
    const restaurant = fallbackStore.createListing("restaurant", req.body);
    return res.status(201).json(restaurant);
  }
  const restaurant = await Restaurant.create(req.body);
  res.status(201).json(restaurant);
};

export const updateRestaurant = async (req, res) => {
  if (!isDatabaseConnected()) {
    const restaurant = fallbackStore.updateListing("restaurant", req.params.id, req.body);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    return res.json(restaurant);
  }
  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
  res.json(restaurant);
};

export const deleteRestaurant = async (req, res) => {
  if (!isDatabaseConnected()) {
    const deleted = fallbackStore.deleteListing("restaurant", req.params.id);
    if (!deleted) return res.status(404).json({ message: "Restaurant not found" });
    return res.json({ message: "Restaurant removed" });
  }
  const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
  res.json({ message: "Restaurant removed" });
};

export const addRestaurantReview = async (req, res) =>
  addReviewToTarget({ model: Restaurant, targetType: "restaurant", req, res });
