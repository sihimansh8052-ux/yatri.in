import Bus from "../models/Bus.js";
import Hotel from "../models/Hotel.js";
import Restaurant from "../models/Restaurant.js";
import TouristPlace from "../models/TouristPlace.js";
import Train from "../models/Train.js";
import User from "../models/User.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";

const nowIso = () => new Date().toISOString();

const normalize = (value = "") => String(value).trim().toLowerCase();

const compactItem = (item, fields) =>
  fields.reduce((acc, field) => {
    if (item?.[field] !== undefined && item?.[field] !== null) acc[field] = item[field];
    return acc;
  }, { _id: item?._id?.toString?.() || item?._id });

const matchesDestination = (value, destination) => normalize(value).includes(normalize(destination));

const getPlannerInventory = async ({ destination = "", origin = "" }) => {
  const destinationRegex = new RegExp(destination, "i");
  const originRegex = origin ? new RegExp(origin, "i") : null;

  if (!isDatabaseConnected()) {
    const hotels = fallbackStore.getHotels().filter((item) => matchesDestination(item.city, destination) || matchesDestination(item.address, destination));
    const places = fallbackStore.getPlaces().filter((item) => matchesDestination(item.city, destination) || matchesDestination(item.address, destination));
    const restaurants = fallbackStore.getRestaurants().filter((item) => matchesDestination(item.city, destination) || matchesDestination(item.address, destination));
    const guides = fallbackStore.getGuides().filter((item) => matchesDestination(item.city, destination) || matchesDestination(item.state, destination));
    const buses = fallbackStore.getBuses({ from: origin, to: destination });
    const trains = fallbackStore.getTrains({ from: origin, to: destination });
    return { hotels, places, restaurants, guides, buses, trains };
  }

  const busQuery = originRegex
    ? {
        $and: [
          { $or: [{ from: originRegex }, { boardingPoints: originRegex }] },
          { $or: [{ to: destinationRegex }, { droppingPoints: destinationRegex }] }
        ]
      }
    : { $or: [{ to: destinationRegex }, { droppingPoints: destinationRegex }, { from: destinationRegex }] };

  const [hotels, places, restaurants, guides, buses, trains] = await Promise.all([
    Hotel.find({ $or: [{ city: destinationRegex }, { address: destinationRegex }, { name: destinationRegex }] })
      .sort({ rating: -1, popularity: -1 })
      .limit(6)
      .lean(),
    TouristPlace.find({ $or: [{ city: destinationRegex }, { address: destinationRegex }, { name: destinationRegex }, { tags: destinationRegex }] })
      .sort({ rating: -1, popularity: -1 })
      .limit(10)
      .lean(),
    Restaurant.find({ $or: [{ city: destinationRegex }, { address: destinationRegex }, { name: destinationRegex }, { cuisine: destinationRegex }] })
      .sort({ rating: -1, popularity: -1 })
      .limit(6)
      .lean(),
    User.find({ role: "tour_guide", $or: [{ city: destinationRegex }, { state: destinationRegex }, { name: destinationRegex }] })
      .sort({ rating: -1, experience: -1 })
      .limit(5)
      .lean(),
    Bus.find(busQuery).sort({ rating: -1, price: 1 }).limit(6).lean(),
    Train.find(busQuery).sort({ rating: -1, price: 1 }).limit(6).lean()
  ]);

  return { hotels, places, restaurants, guides, buses, trains };
};

const buildRecommendations = ({ hotels = [], places = [], restaurants = [], guides = [], buses = [], trains = [] }) => ({
  hotels: hotels.map((item) => compactItem(item, ["name", "city", "address", "priceLevel", "pricePerNight", "rating", "images"])),
  places: places.map((item) => compactItem(item, ["name", "city", "address", "type", "bestTimeToVisit", "rating", "tags", "images"])),
  restaurants: restaurants.map((item) => compactItem(item, ["name", "city", "address", "priceLevel", "rating", "cuisine", "menuHighlights", "images"])),
  guides: guides.map((item) => compactItem(item, ["name", "city", "state", "pricePerDay", "rating", "experience", "languagesSpoken", "profilePhoto", "bio"])),
  buses: buses.map((item) => compactItem(item, ["operatorName", "busType", "from", "to", "departureTime", "arrivalTime", "duration", "price", "rating", "availableSeats"])),
  trains: trains.map((item) => compactItem(item, ["trainNumber", "trainName", "trainType", "from", "to", "departureTime", "arrivalTime", "duration", "price", "rating", "availableSeats", "classes"]))
});

const buildBookingLinks = ({ destination = "Jaipur", origin = "New Delhi" }) => ({
  hotels: `/results?city=${encodeURIComponent(destination)}`,
  buses: `/buses?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}`,
  trains: `/trains?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}`,
  guides: `/results?category=guide&city=${encodeURIComponent(destination)}`,
  restaurants: `/food-discovery?city=${encodeURIComponent(destination)}`,
  places: `/results?category=place&city=${encodeURIComponent(destination)}`
});

const enrichPlan = (plan, params, recommendations) => ({
  ...plan,
  destination: plan.destination || params.destination || "Jaipur",
  days: Number(plan.days || params.days || 3),
  budget: Number(plan.budget || params.budget || 15000),
  recommendations: {
    hotels: plan.recommendations?.hotels?.length ? plan.recommendations.hotels : recommendations.hotels,
    places: plan.recommendations?.places?.length ? plan.recommendations.places : recommendations.places,
    restaurants: plan.recommendations?.restaurants?.length ? plan.recommendations.restaurants : recommendations.restaurants,
    guides: plan.recommendations?.guides?.length ? plan.recommendations.guides : recommendations.guides,
    buses: plan.recommendations?.buses?.length ? plan.recommendations.buses : recommendations.buses,
    trains: plan.recommendations?.trains?.length ? plan.recommendations.trains : recommendations.trains
  },
  bookingLinks: {
    ...buildBookingLinks(params),
    ...(plan.bookingLinks || {})
  },
  generatedAt: plan.generatedAt || nowIso()
});

const generateFallbackItinerary = (params, inventory = {}) => {
  const {
    destination = "Jaipur",
    origin = "New Delhi",
    days = 3,
    budget = 15000,
    tripType = "Solo",
    hotelCategory = "3 Star",
    interests = ["culture"],
    foodPreference = "Veg",
    transportationPreference = "Cab",
    accessibilityRequirements = "None"
  } = params;

  const numDays = Math.min(Math.max(Number(days) || 3, 1), 10);
  const estBudget = Number(budget) || 15000;
  const recommendations = buildRecommendations(inventory);
  const destinationPlaces = recommendations.places.length
    ? recommendations.places
    : [{ name: `${destination} heritage walk`, bestTimeToVisit: "Morning", rating: 4.5 }];
  const foodStops = recommendations.restaurants.length
    ? recommendations.restaurants
    : [{ name: `${destination} local food market`, cuisine: [foodPreference], rating: 4.4 }];
  const hotelPick = recommendations.hotels[0];
  const guidePick = recommendations.guides[0];
  const busPick = recommendations.buses[0];
  const trainPick = recommendations.trains[0];

  // Build specialized content based on trip type & interests
  const activities = {
    culture: [
      "Visit City Palace & local art museums",
      "Attend traditional dance show & puppet theater",
      "Guided walking tour of ancient temples & crafts bazaars",
      "Sanskrit heritage workshop & monument photo trails"
    ],
    food: [
      "Heritage street food walk (Kachoris, sweets, & lassi)",
      "Cooking class with a local family & spice bazaar trip",
      "Rooftop dinner tasting royal thali set menus",
      "Organic farming site visit & tea-tasting sessions"
    ],
    adventure: [
      "Hot air balloon ride over historical forts",
      "Morning cycling tours through mountain tracks",
      "Hike to sunrise fort viewpoints & valley treks",
      "Zipline tour or wildlife sanctuaries exploration"
    ],
    nature: [
      "Stroll through botanic gardens & lake fronts",
      "Sunset boating & bird-watching tour",
      "Scenic landscape drives & village photo walks",
      "Early morning sanctuary tours & eco-parks stroll"
    ],
    devotional: [
      "Morning darshan, temple walk, and pooja booking window",
      "Attend aarti, bhajan, or kirtan with respectful local guidance",
      "Visit nearby ghats, prasad counters, and devotional markets",
      "Plan a calm spiritual evening with family-friendly travel timing"
    ]
  };

  const selectedVibes = interests.flatMap((i) => activities[i] || activities.culture);
  if (selectedVibes.length < 4) selectedVibes.push(...activities.culture);

  const itinerary = Array.from({ length: numDays }).map((_, idx) => {
    const placeOne = destinationPlaces[(idx * 2) % destinationPlaces.length];
    const placeTwo = destinationPlaces[(idx * 2 + 1) % destinationPlaces.length] || placeOne;
    const foodStop = foodStops[idx % foodStops.length];
    const act1 = `${placeOne.name}: ${selectedVibes[(idx * 3) % selectedVibes.length]}`;
    const act2 = `${foodStop.name} ${foodStop.cuisine?.length ? `(${foodStop.cuisine.slice(0, 2).join(", ")})` : ""} lunch, then ${placeTwo.name}`;
    const act3 = selectedVibes[(idx * 3 + 2) % selectedVibes.length];

    return {
      day: idx + 1,
      title: `Day ${idx + 1}: ${idx === 0 ? `${destination} Arrival & ${placeOne.name}` : idx === numDays - 1 ? "Local Food, Shopping & Departure" : `${placeOne.name} to ${placeTwo.name}`}`,
      summary: `A bookable day centered around ${interests.join(" and ")} experiences using Yatri.in local listings.`,
      morning: {
        activity: act1,
        time: "09:00 AM - 12:30 PM",
        cost: Math.round(estBudget * 0.05)
      },
      afternoon: {
        activity: `Enjoy local ${foodPreference} lunch followed by: ${act2}`,
        time: "01:00 PM - 04:30 PM",
        cost: Math.round(estBudget * 0.06)
      },
      evening: {
        activity: `${act3} and travel via ${transportationPreference}${guidePick ? ` with ${guidePick.name} as local guide option` : ""}`,
        time: "05:30 PM - 09:00 PM",
        cost: Math.round(estBudget * 0.04)
      },
      tips: `Book ${hotelPick?.name || "a verified stay"} early. ${trainPick ? `${trainPick.trainName} train option is available. ` : busPick ? `${busPick.operatorName} is available from ${busPick.from} to ${busPick.to}. ` : ""}Accessibility: ${accessibilityRequirements}.`,
      visitingHours: placeOne.bestTimeToVisit || "09:00 AM - 09:00 PM"
    };
  });

  // Calculate detailed budget splits
  const stay = Math.round(estBudget * 0.40);
  const food = Math.round(estBudget * 0.20);
  const transit = Math.round(estBudget * 0.15);
  const sightseeing = Math.round(estBudget * 0.12);
  const shopping = Math.round(estBudget * 0.08);
  const emergency = Math.round(estBudget * 0.05);

  // Packing list
  const clothing = tripType === "Adventure" 
    ? ["Sturdy hiking shoes", "Dry-fit activewear", "Comfortable socks", "Light jacket"]
    : ["Smart casual shirts", "Comfortable cotton trousers", "Sun protective hat", "Walking shoes"];

  const accessories = ["Polarized sunglasses", "Sunscreen SPF 50+", "Reusable water bottle", "Compact umbrella"];
  const electronics = ["Mobile charger", "Power bank 10000mAh", "Universal adapter", "Noise-cancelling earbuds"];
  const medicines = ["Personal prescriptions", "Digestive care tablets", "Antihistamines", "First-aid bandages"];
  const documents = ["Aadhaar/Passport copies", "Hotel Booking confirmation voucher", "Digital payment confirmations", "Travel insurance papers"];

  return {
    destination,
    days: numDays,
    budget: estBudget,
    tripType,
    hotelCategory,
    weather: {
      temperature: "28°C - 34°C",
      condition: "Mostly sunny with a light pleasant breeze. High humidity during midday.",
      recommendation: "Prefer cotton shirts and wear sunscreen during daylight tours."
    },
    packingList: {
      clothing,
      accessories,
      electronics,
      medicines,
      documents
    },
    breakdown: {
      stay,
      food,
      transit,
      sightseeing,
      shopping,
      emergency,
      total: stay + food + transit + sightseeing + shopping + emergency
    },
    recommendations,
    bookingLinks: buildBookingLinks({ destination, origin }),
    generatedAt: nowIso(),
    itinerary
  };
};

export const generatePlanFromAI = async (params) => {
  const inventory = await getPlannerInventory(params);
  const recommendations = buildRecommendations(inventory);
  const openAiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const systemPrompt = `You are a luxury travel guide and AI architect. Generate a highly detailed structured travel itinerary in JSON format for the specified destination and parameters.
Ensure the output JSON strictly matches this schema:
{
  "destination": "string",
  "days": number,
  "budget": number,
  "tripType": "string",
  "hotelCategory": "string",
  "weather": {
    "temperature": "string",
    "condition": "string",
    "recommendation": "string"
  },
  "packingList": {
    "clothing": ["string"],
    "accessories": ["string"],
    "electronics": ["string"],
    "medicines": ["string"],
    "documents": ["string"]
  },
  "breakdown": {
    "stay": number,
    "food": number,
    "transit": number,
    "sightseeing": number,
    "shopping": number,
    "emergency": number,
    "total": number
  },
  "recommendations": {
    "hotels": [],
    "places": [],
    "restaurants": [],
    "guides": [],
    "buses": [],
    "trains": []
  },
  "bookingLinks": {
    "hotels": "string",
    "buses": "string",
    "guides": "string",
    "restaurants": "string",
    "places": "string"
  },
  "itinerary": [
    {
      "day": number,
      "title": "string",
      "summary": "string",
      "morning": { "activity": "string", "time": "string", "cost": number },
      "afternoon": { "activity": "string", "time": "string", "cost": number },
      "evening": { "activity": "string", "time": "string", "cost": number },
      "tips": "string",
      "visitingHours": "string"
    }
  ]
}`;

  const userPrompt = `Destination: ${params.destination}
Duration: ${params.days} Days
Budget: Rs. ${params.budget}
Trip Vibe: ${params.tripType}
Hotel Standard: ${params.hotelCategory}
Interests: ${params.interests?.join(", ")}
Dietary Style: ${params.foodPreference}
Transit Mode: ${params.transportationPreference}
Accessibility: ${params.accessibilityRequirements}`;
  const inventoryPrompt = `Use these live Yatri.in listings where relevant. Return them in recommendations without inventing IDs:
${JSON.stringify(recommendations).slice(0, 6000)}`;

  // 1. Try OpenAI if key is present
  if (openAiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `${userPrompt}\n\n${inventoryPrompt}` }
          ]
        })
      });

      if (response.ok) {
        const json = await response.json();
        return enrichPlan(JSON.parse(json.choices[0].message.content), params, recommendations);
      }
    } catch (err) {
      console.warn("OpenAI generation failed, falling back to local engine:", err.message);
    }
  }

  // 2. Try Gemini if key is present
  if (geminiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\nUser Input:\n${userPrompt}\n\n${inventoryPrompt}` }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (response.ok) {
        const json = await response.json();
        return enrichPlan(JSON.parse(json.candidates[0].content.parts[0].text), params, recommendations);
      }
    } catch (err) {
      console.warn("Gemini generation failed, falling back to local engine:", err.message);
    }
  }

  // 3. Sandbox local fallback
  return generateFallbackItinerary(params, inventory);
};
