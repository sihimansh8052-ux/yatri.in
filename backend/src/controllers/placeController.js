import TouristPlace from "../models/TouristPlace.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";
import { googleGetPlaceDetails, googleSearchByCategory, hasGooglePlacesApi } from "../services/googlePlacesService.js";
import { addReviewToTarget, filterByCommonQuery, getItemWithReviews } from "./placeHelpers.js";

const isMongoId = (value) => /^[a-fA-F0-9]{24}$/.test(value);

export const getPlaces = async (req, res) => {
  if (hasGooglePlacesApi() && (req.query.city || req.query.search || (req.query.lat && req.query.lng) || req.query.category)) {
    const category = req.query.category === "local-experience" ? "local-experience" : "place";
    try {
      const places = await googleSearchByCategory({ category, ...req.query, limit: 12 });
      return res.json(places);
    } catch (error) {
      console.warn("Google places search failed, falling back to local database:", error.message);
    }
  }
  const places = isDatabaseConnected()
    ? await TouristPlace.find().sort({ createdAt: -1 })
    : fallbackStore.getPlaces();
  res.json(filterByCommonQuery(places, req.query));
};

export const getPlaceById = async (req, res) => {
  if (hasGooglePlacesApi() && !isMongoId(req.params.id)) {
    try {
      const place = await googleGetPlaceDetails(req.params.id, "place");
      return res.json(place);
    } catch (_error) {}
  }
  if (!isDatabaseConnected()) {
    const place = fallbackStore.findListingById("place", req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });
    return res.json({ ...place, reviews: [] });
  }
  const place = await getItemWithReviews(TouristPlace, "place", req.params.id);
  if (!place) return res.status(404).json({ message: "Place not found" });
  res.json(place);
};

export const createPlace = async (req, res) => {
  if (!isDatabaseConnected()) {
    const place = fallbackStore.createListing("place", req.body);
    return res.status(201).json(place);
  }
  const place = await TouristPlace.create(req.body);
  res.status(201).json(place);
};

export const updatePlace = async (req, res) => {
  if (!isDatabaseConnected()) {
    const place = fallbackStore.updateListing("place", req.params.id, req.body);
    if (!place) return res.status(404).json({ message: "Place not found" });
    return res.json(place);
  }
  const place = await TouristPlace.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!place) return res.status(404).json({ message: "Place not found" });
  res.json(place);
};

export const deletePlace = async (req, res) => {
  if (!isDatabaseConnected()) {
    const deleted = fallbackStore.deleteListing("place", req.params.id);
    if (!deleted) return res.status(404).json({ message: "Place not found" });
    return res.json({ message: "Place removed" });
  }
  const place = await TouristPlace.findByIdAndDelete(req.params.id);
  if (!place) return res.status(404).json({ message: "Place not found" });
  res.json({ message: "Place removed" });
};

export const addPlaceReview = async (req, res) =>
  addReviewToTarget({ model: TouristPlace, targetType: "place", req, res });
