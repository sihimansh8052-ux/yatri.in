import Hotel from "../models/Hotel.js";
import Restaurant from "../models/Restaurant.js";
import TouristPlace from "../models/TouristPlace.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";
import {
  googleSearchByCategory,
  googleSearchNearby,
  getPlacesProvider,
  hasGooglePlacesApi
} from "../services/googlePlacesService.js";
import { applyQueryFilters, filterByCommonQuery, normalizeCollectionItem } from "./placeHelpers.js";
import { attachDistance } from "../utils/geo.js";

export const getNearbyResults = async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius || 10000);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ message: "lat and lng are required" });
  }

  if (hasGooglePlacesApi()) {
    try {
      const category = req.query.category;
      const categories =
        category && category !== "all"
          ? [category === "attraction" ? "place" : category]
          : ["hotel", "restaurant", "place"];
      const liveResults = (
        await Promise.all(
          categories.map((item) =>
            googleSearchNearby({
              category: item === "hidden-gem" ? "place" : item,
              lat,
              lng,
              radius,
              limit: 8
            })
          )
        )
      ).flat();

      return res.json(applyQueryFilters(attachDistance(liveResults, lat, lng), req.query));
    } catch (error) {
      console.warn("Google Places nearby search failed, falling back:", error.message);
    }
  }

  const [hotels, restaurants, places] = isDatabaseConnected()
    ? await Promise.all([Hotel.find(), Restaurant.find(), TouristPlace.find()])
    : [fallbackStore.getHotels(), fallbackStore.getRestaurants(), fallbackStore.getPlaces()];

  const combined = [
    ...attachDistance(hotels, lat, lng).map((item) => ({ ...item, entityType: "hotel" })),
    ...attachDistance(restaurants, lat, lng).map((item) => ({ ...item, entityType: "restaurant" })),
    ...attachDistance(places, lat, lng).map((item) => ({ ...item, entityType: "place" }))
  ].filter((item) => item.distance <= radius);

  res.json(applyQueryFilters(combined, req.query));
};

export const getRecommendations = async (req, res) => {
  const interests = String(req.query.interest || "").split(",").filter(Boolean);

  if (hasGooglePlacesApi() && (req.query.city || (req.query.lat && req.query.lng))) {
    try {
      const buckets = [];
      if (interests.includes("food")) {
        buckets.push(
          ...(await googleSearchByCategory({ category: "restaurant", ...req.query, limit: 4 })).map((item) => ({
            ...item,
            match: "food"
          }))
        );
      }
      if (interests.includes("culture")) {
        buckets.push(
          ...(await googleSearchByCategory({ category: "place", ...req.query, limit: 4 })).map((item) => ({
            ...item,
            match: "culture"
          }))
        );
      }
      if (interests.includes("adventure")) {
        buckets.push(
          ...(await googleSearchByCategory({ category: "local-experience", ...req.query, limit: 4 })).map((item) => ({
            ...item,
            match: "adventure"
          }))
        );
      }
      buckets.push(
        ...(await googleSearchByCategory({ category: "hotel", ...req.query, limit: 3 })).map((item) => ({
          ...item,
          match: "stay"
        }))
      );
      return res.json(buckets);
    } catch (error) {
      console.warn("Google Places recommendations failed, falling back:", error.message);
    }
  }

  const [restaurants, places, hotels] = isDatabaseConnected()
    ? await Promise.all([Restaurant.find(), TouristPlace.find(), Hotel.find()])
    : [fallbackStore.getRestaurants(), fallbackStore.getPlaces(), fallbackStore.getHotels()];

  const foodHits = interests.includes("food")
    ? restaurants.slice(0, 4).map((item) => ({ ...normalizeCollectionItem(item), entityType: "restaurant", match: "food" }))
    : [];
  const cultureHits = interests.includes("culture")
    ? places
        .filter((item) => item.tags?.includes("culture") || item.tags?.includes("heritage"))
        .slice(0, 4)
        .map((item) => ({ ...normalizeCollectionItem(item), entityType: "place", match: "culture" }))
    : [];
  const adventureHits = interests.includes("adventure")
    ? places
        .filter((item) => item.tags?.includes("adventure") || item.tags?.includes("nature"))
        .slice(0, 4)
        .map((item) => ({ ...normalizeCollectionItem(item), entityType: "place", match: "adventure" }))
    : [];

  const stayHits = hotels
    .slice(0, 3)
    .map((item) => ({ ...normalizeCollectionItem(item), entityType: "hotel", match: "stay" }));
  res.json([...foodHits, ...cultureHits, ...adventureHits, ...stayHits]);
};

export const getExploreResults = async (req, res) => {
  if (hasGooglePlacesApi()) {
    const requestedCategory = req.query.category;
    const categories =
      requestedCategory && requestedCategory !== "all"
        ? [requestedCategory === "attraction" ? "place" : requestedCategory]
        : ["hotel", "restaurant", "place", "local-experience"];
    try {
      const liveQuery = {
        ...req.query,
        city: req.query.city || "New Delhi"
      };
      const combined = (
        await Promise.all(
          categories.map((item) =>
            googleSearchByCategory({
              category: item === "hidden-gem" ? "place" : item,
              ...liveQuery,
              limit: item === "local-experience" ? 6 : 8
            })
          )
        )
      ).flat();

      const items = filterByCommonQuery(combined, req.query);
      return res.json({
        provider: getPlacesProvider(),
        message: "Live results from Google Places API",
        items,
        topPlaces: [...combined].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6),
        trendingDestinations: [...combined]
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, 6)
      });
    } catch (error) {
      console.warn("Google Places explore request failed, falling back to sample data:", error.message);
    }
  }

  const [hotels, restaurants, places] = isDatabaseConnected()
    ? await Promise.all([Hotel.find(), Restaurant.find(), TouristPlace.find()])
    : [fallbackStore.getHotels(), fallbackStore.getRestaurants(), fallbackStore.getPlaces()];

  const combined = [
    ...hotels.map((item) => ({ ...normalizeCollectionItem(item), entityType: "hotel" })),
    ...restaurants.map((item) => ({ ...normalizeCollectionItem(item), entityType: "restaurant" })),
    ...places.map((item) => ({ ...normalizeCollectionItem(item), entityType: "place" }))
  ];

  const items = filterByCommonQuery(combined, req.query);
  res.json({
    provider: getPlacesProvider(),
    message: "Sample fallback results. Add GOOGLE_MAPS_API_KEY for live places.",
    items,
    topPlaces: [...combined]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6),
    trendingDestinations: [...combined]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 6)
  });
};

export const getHighlights = async (_req, res) => {
  if (hasGooglePlacesApi()) {
    try {
      const [topPlaces, localExperiences, featuredHotels, foodNearTajMahal] = await Promise.all([
        googleSearchByCategory({ category: "place", city: "New Delhi", limit: 4 }),
        googleSearchByCategory({ category: "local-experience", city: "New Delhi", limit: 4 }),
        googleSearchByCategory({ category: "hotel", city: "New Delhi", limit: 4 }),
        googleSearchByCategory({ category: "restaurant", city: "Agra", search: "food near Taj Mahal", limit: 3 })
      ]);

      return res.json({
        provider: getPlacesProvider(),
        message: "Live highlights from Google Places API",
        topPlaces,
        trendingDestinations: [...topPlaces].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 4),
        localExperiences,
        featuredHotels,
        foodNearTajMahal: foodNearTajMahal.map((item) => ({
          ...item,
          suggestion: "Great for travelers looking for flavorful stops after a monument day."
        }))
      });
    } catch (error) {
      console.warn("Google Places highlights failed, falling back to sample data:", error.message);
    }
  }

  const [hotels, restaurants, places] = isDatabaseConnected()
    ? await Promise.all([Hotel.find(), Restaurant.find(), TouristPlace.find()])
    : [fallbackStore.getHotels(), fallbackStore.getRestaurants(), fallbackStore.getPlaces()];

  const allPlaces = places.map(normalizeCollectionItem);
  const allRestaurants = restaurants.map(normalizeCollectionItem);

  res.json({
    provider: getPlacesProvider(),
    message: "Sample fallback highlights. Add GOOGLE_MAPS_API_KEY for live places.",
    topPlaces: allPlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4),
    trendingDestinations: allPlaces.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 4),
    localExperiences: allPlaces.filter((item) => item.category === "local-experience").slice(0, 4),
    featuredHotels: hotels.map(normalizeCollectionItem).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4),
    foodNearTajMahal: allRestaurants.slice(0, 3).map((item) => ({
      ...item,
      suggestion: "Great for travelers looking for flavorful stops after a monument day."
    }))
  });
};

export const getStreetFoodRecommendations = async (req, res) => {
  let lat = Number(req.query.lat);
  let lng = Number(req.query.lng);
  const { hotelId, budget = "mid", preference = "all", spicy = "medium" } = req.query;

  if (hotelId) {
    if (isDatabaseConnected()) {
      try {
        const hotel = await Hotel.findById(hotelId);
        if (hotel && hotel.location?.coordinates) {
          [lng, lat] = hotel.location.coordinates;
        }
      } catch (_) {}
    } else {
      const hotel = fallbackStore.findListingById("hotel", hotelId);
      if (hotel && hotel.location?.coordinates) {
        [lng, lat] = hotel.location.coordinates;
      }
    }
  }

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    // Default to Delhi Center
    lat = 28.6139;
    lng = 77.2090;
  }

  // Fetch all food spots nearby
  let foodSpots = [];
  if (hasGooglePlacesApi()) {
    try {
      foodSpots = await googleSearchNearby({ category: "restaurant", lat, lng, radius: 10000, limit: 12 });
    } catch (_) {}
  }

  if (foodSpots.length === 0) {
    foodSpots = isDatabaseConnected()
      ? await Restaurant.find()
      : fallbackStore.getRestaurants();
  }

  // Calculate dynamic AI scoring and reasons
  const scored = attachDistance(foodSpots, lat, lng).map((spot) => {
    let score = 75;
    let reason = "Highly rated local spot near your location.";

    const name = spot.name.toLowerCase();
    const cuisines = (spot.cuisine || []).map(c => c.toLowerCase());
    
    const isSweetOrDessert = name.includes("dessert") || name.includes("sweets") || name.includes("kulfi") || name.includes("bakery");
    const isSpicyStreetFood = name.includes("chaat") || name.includes("street") || name.includes("tikki") || name.includes("dhaba");

    if (preference === "veg") {
      const isVeg = name.includes("veg") || name.includes("pure") || cuisines.includes("vegetarian");
      if (isVeg) {
        score += 15;
        reason = "Recommended: Offers pure vegetarian Indian snacks, matching your preferences.";
      } else {
        score -= 10;
      }
    }

    if (spicy === "high" && isSpicyStreetFood) {
      score += 10;
      reason = "Recommended: Perfect choice for travelers who love spicy, authentic street flavors.";
    } else if (spicy === "low" && isSweetOrDessert) {
      score += 12;
      reason = "Recommended: Excellent spot for low-spice, sweet traditional delicacies.";
    } else if (budget === "budget" && spot.priceLevel === "budget") {
      score += 10;
      reason = "Recommended: Outstanding budget culinary option with high local rating.";
    } else if (budget === "premium" && spot.priceLevel === "premium") {
      score += 10;
      reason = "Recommended: Premium fine-dining experience with chef specials.";
    }

    // Clamp score
    score = Math.min(98, Math.max(60, score));

    return {
      ...normalizeCollectionItem(spot),
      aiScore: score,
      aiReason: reason,
      walkingTime: `${Math.ceil(spot.distance / 80)} mins`,
      drivingTime: `${Math.ceil(spot.distance / 250)} mins`
    };
  });

  // Sort by AI score descending
  res.json(scored.sort((a, b) => b.aiScore - a.aiScore));
};
