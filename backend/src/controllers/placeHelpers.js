import Review from "../models/Review.js";
import { haversineDistance } from "../utils/geo.js";

export const applyQueryFilters = (items, { category, price, rating, sort }) => {
  let filtered = [...items];

  if (category && category !== "all") {
    filtered = filtered.filter((item) => item.category === category || item.type === category);
  }

  if (price && price !== "all") {
    filtered = filtered.filter((item) => item.priceLevel === price);
  }

  if (rating) {
    filtered = filtered.filter((item) => Number(item.rating) >= Number(rating));
  }

  if (sort === "popularity") {
    filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  } else if (sort === "rating") {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else {
    filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  return filtered;
};

export const normalizeCollectionItem = (item) =>
  typeof item.toObject === "function" ? item.toObject() : item;

const normalizeSearchText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\bpayagraj\b/g, "prayagraj")
    .replace(/\ballahabad\b/g, "prayagraj");

export const filterByCommonQuery = (items, query = {}) => {
  const {
    city,
    search,
    budget,
    price,
    rating,
    distance,
    lat,
    lng,
    category,
    sort = "popularity"
  } = query;

  let next = items.map(normalizeCollectionItem);

  if (city) {
    const destinationNeedle = normalizeSearchText(city);
    next = next.filter((item) => {
      const haystack = [
        item.name,
        item.city,
        item.state,
        item.address,
        item.description,
        ...(item.tags || []),
        ...(item.cuisine || []),
        ...(item.amenities || []),
        ...(item.aliases || [])
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .replace(/\ballahabad\b/g, "prayagraj");
      return haystack.includes(destinationNeedle);
    });
  }

  if (search) {
    const needle = normalizeSearchText(search);
    next = next.filter(
      (item) =>
        normalizeSearchText(item.name).includes(needle) ||
        normalizeSearchText(item.city).includes(needle) ||
        normalizeSearchText(item.description).includes(needle) ||
        normalizeSearchText(item.address).includes(needle) ||
        item.tags?.some((tag) => normalizeSearchText(tag).includes(needle)) ||
        item.cuisine?.some((tag) => normalizeSearchText(tag).includes(needle)) ||
        item.amenities?.some((tag) => normalizeSearchText(tag).includes(needle)) ||
        item.aliases?.some((tag) => normalizeSearchText(tag).includes(needle))
    );
  }

  const priceValue = budget || price;
  if (priceValue && priceValue !== "all") {
    next = next.filter((item) => item.priceLevel === priceValue);
  }

  if (rating) {
    next = next.filter((item) => Number(item.rating || 0) >= Number(rating));
  }

  if (category && category !== "all") {
    next = next.filter((item) => item.category === category || item.type === category);
  }

  if (lat && lng) {
    next = next.map((item) => ({
      ...item,
      distance: haversineDistance(Number(lat), Number(lng), item.location.coordinates[1], item.location.coordinates[0])
    }));
    if (distance) {
      next = next.filter((item) => item.distance <= Number(distance));
    }
  }

  if (sort === "nearest") {
    next.sort((a, b) => (a.distance || Number.MAX_SAFE_INTEGER) - (b.distance || Number.MAX_SAFE_INTEGER));
  } else if (sort === "rating") {
    next.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else {
    next.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  return next;
};

export const addReviewToTarget = async ({ model, targetType, req, res }) => {
  const target = await model.findById(req.params.id);
  if (!target) {
    return res.status(404).json({ message: "Item not found" });
  }

  await Review.create({
    user: req.user._id,
    targetId: target._id,
    targetType,
    rating: req.body.rating,
    comment: req.body.comment
  });

  const reviews = await Review.find({ targetId: target._id, targetType });
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  target.rating = Number(average.toFixed(1));
  await target.save();

  res.status(201).json(target);
};

export const getItemWithReviews = async (model, targetType, id) => {
  const item = await model.findById(id);
  if (!item) return null;
  const reviews = await Review.find({ targetId: id, targetType }).populate("user", "name");
  return { ...item.toObject(), reviews };
};
