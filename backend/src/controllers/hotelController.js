import Hotel from "../models/Hotel.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";
import { googleGetPlaceDetails, googleSearchByCategory, hasGooglePlacesApi } from "../services/googlePlacesService.js";
import { addReviewToTarget, filterByCommonQuery, getItemWithReviews } from "./placeHelpers.js";

const isMongoId = (value) => /^[a-fA-F0-9]{24}$/.test(value);

export const getHotels = async (req, res) => {
  if (hasGooglePlacesApi() && (req.query.city || req.query.search || (req.query.lat && req.query.lng))) {
    try {
      const hotels = await googleSearchByCategory({ category: "hotel", ...req.query, limit: 12 });
      return res.json(hotels);
    } catch (error) {
      console.warn("Google hotel search failed, falling back to local database:", error.message);
    }
  }
  const hotels = isDatabaseConnected() ? await Hotel.find().sort({ createdAt: -1 }) : fallbackStore.getHotels();
  res.json(filterByCommonQuery(hotels, req.query));
};

export const getHotelById = async (req, res) => {
  if (hasGooglePlacesApi() && !isMongoId(req.params.id)) {
    try {
      const hotel = await googleGetPlaceDetails(req.params.id, "hotel");
      return res.json(hotel);
    } catch (_error) {}
  }
  if (!isDatabaseConnected()) {
    const hotel = fallbackStore.findListingById("hotel", req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    return res.json({ ...hotel, reviews: [] });
  }
  const hotel = await getItemWithReviews(Hotel, "hotel", req.params.id);
  if (!hotel) return res.status(404).json({ message: "Hotel not found" });
  res.json(hotel);
};

export const createHotel = async (req, res) => {
  if (!isDatabaseConnected()) {
    const hotel = fallbackStore.createListing("hotel", req.body);
    return res.status(201).json(hotel);
  }
  const hotel = await Hotel.create(req.body);
  res.status(201).json(hotel);
};

export const updateHotel = async (req, res) => {
  if (!isDatabaseConnected()) {
    const hotel = fallbackStore.updateListing("hotel", req.params.id, req.body);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    return res.json(hotel);
  }
  const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!hotel) return res.status(404).json({ message: "Hotel not found" });
  res.json(hotel);
};

export const deleteHotel = async (req, res) => {
  if (!isDatabaseConnected()) {
    const deleted = fallbackStore.deleteListing("hotel", req.params.id);
    if (!deleted) return res.status(404).json({ message: "Hotel not found" });
    return res.json({ message: "Hotel removed" });
  }
  const hotel = await Hotel.findByIdAndDelete(req.params.id);
  if (!hotel) return res.status(404).json({ message: "Hotel not found" });
  res.json({ message: "Hotel removed" });
};

export const addHotelReview = async (req, res) =>
  addReviewToTarget({ model: Hotel, targetType: "hotel", req, res });
