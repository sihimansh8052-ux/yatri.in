const GOOGLE_PLACES_BASE_URL = "https://places.googleapis.com/v1";

const GOOGLE_SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.photos",
  "places.primaryType",
  "places.types",
  "places.priceLevel",
  "places.priceRange",
  "places.businessStatus",
  "places.editorialSummary",
  "places.regularOpeningHours",
  "places.websiteUri",
  "places.googleMapsUri"
].join(",");

const GOOGLE_DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "rating",
  "userRatingCount",
  "photos",
  "primaryType",
  "types",
  "priceLevel",
  "priceRange",
  "businessStatus",
  "editorialSummary",
  "websiteUri",
  "googleMapsUri",
  "reviews",
  "nationalPhoneNumber",
  "regularOpeningHours"
].join(",");

const priceLevelMap = {
  PRICE_LEVEL_INEXPENSIVE: "budget",
  PRICE_LEVEL_MODERATE: "mid",
  PRICE_LEVEL_EXPENSIVE: "premium",
  PRICE_LEVEL_VERY_EXPENSIVE: "premium"
};

const categoryMap = {
  hotel: { query: "hotels", includedType: "hotel", entityType: "hotel", category: "hotel" },
  restaurant: {
    query: "restaurants",
    includedType: "restaurant",
    entityType: "restaurant",
    category: "restaurant"
  },
  place: {
    query: "tourist attractions",
    includedType: "tourist_attraction",
    entityType: "place",
    category: "attraction"
  },
  "local-experience": {
    query: "local experiences markets temples parks",
    includedType: "tourist_attraction",
    entityType: "place",
    category: "local-experience"
  }
};

export const hasGooglePlacesApi = () => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return false;
  const trimmed = key.trim();
  const lowered = trimmed.toLowerCase();
  if (!trimmed || lowered.includes("your") || lowered.includes("replace") || lowered.includes("placeholder") || trimmed.length < 20) {
    return false;
  }
  return true;
};

export const getPlacesProvider = () => (hasGooglePlacesApi() ? "google" : "sample");

const requestGooglePlaces = async ({ path, method = "GET", body, fieldMask }) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Places API key is missing");
  }

  const response = await fetch(`${GOOGLE_PLACES_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldMask
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Places request failed: ${response.status} ${text}`);
  }

  return response.json();
};

const photoUri = (photoName) =>
  `${GOOGLE_PLACES_BASE_URL}/${photoName}/media?maxHeightPx=900&maxWidthPx=1200&key=${process.env.GOOGLE_MAPS_API_KEY}`;

const normalizeGooglePlace = (place, forcedType = null) => {
  const entityType =
    forcedType ||
    (place.primaryType === "restaurant"
      ? "restaurant"
      : place.primaryType === "hotel"
        ? "hotel"
        : "place");

  const category =
    entityType === "hotel"
      ? "hotel"
      : entityType === "restaurant"
        ? "restaurant"
        : place.types?.some((type) => ["market", "park", "hindu_temple"].includes(type))
          ? "local-experience"
          : "attraction";

  const featureLabels = (place.types || [])
    .slice(0, 6)
    .map((type) =>
      type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );

  return {
    _id: place.id,
    googlePlaceId: place.id,
    googleResourceName: place.name,
    name: place.displayName?.text || "Unknown place",
    description: place.editorialSummary?.text || place.formattedAddress || "No description available.",
    address: place.formattedAddress || "",
    city: place.formattedAddress?.split(",").slice(-3, -2)[0]?.trim() || place.formattedAddress || "",
    priceLevel: priceLevelMap[place.priceLevel] || "mid",
    priceRange: place.priceRange,
    pricePerNight: undefined,
    rating: place.rating || 0,
    userRatingCount: place.userRatingCount || 0,
    popularity: place.userRatingCount || 0,
    images: place.photos?.length ? place.photos.map((photo) => photoUri(photo.name)) : [],
    category,
    entityType,
    cuisine: entityType === "restaurant" ? place.types || [] : undefined,
    menuHighlights: [],
    amenities: featureLabels,
    features: featureLabels,
    tags: place.types || [],
    businessStatus: place.businessStatus,
    openNow: place.regularOpeningHours?.openNow,
    openingHours: place.regularOpeningHours?.weekdayDescriptions || [],
    bestTimeToVisit: "",
    googleMapsUri: place.googleMapsUri,
    websiteUri: place.websiteUri,
    phoneNumber: place.nationalPhoneNumber,
    reviews: (place.reviews || []).map((review) => ({
      _id: `${place.id}-${review.relativePublishTimeDescription || Math.random()}`,
      rating: review.rating,
      comment: review.text?.text || "",
      user: { name: review.authorAttribution?.displayName || "Google user" }
    })),
    location: {
      type: "Point",
      coordinates: [place.location?.longitude || 0, place.location?.latitude || 0]
    }
  };
};

const buildSearchBody = ({ textQuery, includedType, minRating, priceLevels, lat, lng, pageSize = 12 }) => ({
  textQuery,
  includedType,
  minRating: minRating ? Number(minRating) : undefined,
  strictTypeFiltering: Boolean(includedType),
  pageSize: Math.min(Number(pageSize) || 12, 20),
  ...(priceLevels?.length ? { priceLevels } : {}),
  ...(lat && lng
    ? {
        locationBias: {
          circle: {
            center: { latitude: Number(lat), longitude: Number(lng) },
            radius: 20000
          }
        }
      }
    : {})
});

const mapBudgetToPriceLevels = (budget) => {
  if (budget === "budget") return ["PRICE_LEVEL_INEXPENSIVE"];
  if (budget === "mid") return ["PRICE_LEVEL_MODERATE"];
  if (budget === "premium") return ["PRICE_LEVEL_EXPENSIVE", "PRICE_LEVEL_VERY_EXPENSIVE"];
  return [];
};

export const googleSearchByCategory = async ({
  category = "place",
  city,
  search,
  rating,
  budget,
  lat,
  lng,
  limit = 12
}) => {
  const config = categoryMap[category] || categoryMap.place;
  const locationLabel = city || (lat && lng ? "nearby" : "India");
  const query = search?.trim()
    ? `${search} ${city ? `in ${city}` : ""}`.trim()
    : `${config.query} in ${locationLabel}`.trim();

  const data = await requestGooglePlaces({
    path: "/places:searchText",
    method: "POST",
    fieldMask: GOOGLE_SEARCH_FIELD_MASK,
    body: buildSearchBody({
      textQuery: query,
      includedType: config.includedType,
      minRating: rating,
      priceLevels: mapBudgetToPriceLevels(budget),
      lat,
      lng,
      pageSize: limit
    })
  });

  return (data.places || []).map((place) => normalizeGooglePlace(place, config.entityType));
};

export const googleSearchNearby = async ({ category = "place", lat, lng, radius = 15000, limit = 12 }) => {
  const config = categoryMap[category] || categoryMap.place;
  const data = await requestGooglePlaces({
    path: "/places:searchNearby",
    method: "POST",
    fieldMask: GOOGLE_SEARCH_FIELD_MASK,
    body: {
      includedTypes: [config.includedType],
      maxResultCount: Math.min(Number(limit) || 12, 20),
      rankPreference: "DISTANCE",
      locationRestriction: {
        circle: {
          center: { latitude: Number(lat), longitude: Number(lng) },
          radius: Number(radius)
        }
      }
    }
  });

  return (data.places || []).map((place) => normalizeGooglePlace(place, config.entityType));
};

export const googleGetPlaceDetails = async (placeId, type = "place") => {
  const data = await requestGooglePlaces({
    path: `/places/${placeId}`,
    fieldMask: GOOGLE_DETAILS_FIELD_MASK
  });

  return normalizeGooglePlace(data, type);
};
