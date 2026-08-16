import Package from "../models/Package.js";
import Bus from "../models/Bus.js";
import Train from "../models/Train.js";
import mongoose from "mongoose";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const splitDestinations = (destination = "") =>
  String(destination)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const compactBus = (bus) => ({
  _id: bus._id?.toString?.() || bus._id,
  operatorName: bus.operatorName,
  busType: bus.busType,
  from: bus.from,
  to: bus.to,
  departureTime: bus.departureTime,
  arrivalTime: bus.arrivalTime,
  duration: bus.duration,
  price: bus.price,
  boardingPoints: bus.boardingPoints || [],
  droppingPoints: bus.droppingPoints || []
});

const compactTrain = (train) => ({
  _id: train._id?.toString?.() || train._id,
  trainNumber: train.trainNumber,
  trainName: train.trainName,
  trainType: train.trainType,
  from: train.from,
  to: train.to,
  departureTime: train.departureTime,
  arrivalTime: train.arrivalTime,
  duration: train.duration,
  price: train.price,
  boardingStations: train.boardingStations || [],
  droppingStations: train.droppingStations || [],
  classes: train.classes || []
});

const buildLocalTransfers = (pkg) => {
  const destinations = splitDestinations(pkg.destination);
  const dayTitles = (pkg.itinerary || []).map((day) => day.title).join(" ");
  const notes = [
    "Hotel pickup and drop are coordinated around package sightseeing timings.",
    "Traveler should keep 45-60 minutes buffer before train/bus departure.",
    "For temple/pooja days, early morning transfers are recommended to avoid queues."
  ];

  if (/goa/i.test(pkg.destination)) notes.unshift("Use cab from Madgaon/Thivim/Mapusa/Panjim to beach hotel.");
  if (/varanasi/i.test(pkg.destination)) notes.unshift("Use e-rickshaw or walking route near old city ghats; large cabs may not enter inner lanes.");
  if (/mathura|vrindavan/i.test(pkg.destination)) notes.unshift("Use local cab between Mathura Junction, Banke Bihari Temple, Prem Mandir, and Agra/Delhi road exits.");
  if (/manali/i.test(pkg.destination)) notes.unshift("Use Volvo bus arrival transfer from Manali Private Bus Stand to hotel.");
  if (/jaipur/i.test(pkg.destination)) notes.unshift("Use cab from Jaipur Junction/Sindhi Camp to hotel, then local cab for forts and bazaars.");

  return [
    ...destinations.map((city) => `Local transfer available around ${city} for hotel, sightseeing, food stops, and station/bus stand pickup.`),
    ...notes,
    dayTitles ? `Itinerary places covered: ${dayTitles}` : ""
  ].filter(Boolean);
};

const enrichPackageTravelOptions = async (pkg) => {
  const plain = pkg.toObject ? pkg.toObject() : { ...pkg };
  if (plain.travelOptions?.busRoutes?.length || plain.travelOptions?.trainRoutes?.length) {
    return plain;
  }

  const destinations = splitDestinations(plain.destination);
  const patterns = destinations.map((item) => new RegExp(escapeRegex(item), "i"));
  if (!patterns.length) return plain;

  const routeFilter = {
    $or: patterns.flatMap((pattern) => [{ to: pattern }, { droppingPoints: pattern }, { droppingStations: pattern }])
  };
  const busFilter = { $or: patterns.flatMap((pattern) => [{ to: pattern }, { droppingPoints: pattern }]) };
  const trainFilter = { $or: patterns.flatMap((pattern) => [{ to: pattern }, { droppingStations: pattern }]) };

  const [buses, trains] = await Promise.all([
    Bus.find(busFilter).sort({ rating: -1, price: 1 }).limit(5).lean(),
    Train.find(trainFilter).sort({ rating: -1, price: 1 }).limit(5).lean()
  ]);

  plain.travelOptions = {
    summary: `Best available public transport options for ${plain.destination}. Package also includes planned local transfers where listed.`,
    busRoutes: buses.map(compactBus),
    trainRoutes: trains.map(compactTrain),
    localTransfers: buildLocalTransfers(plain),
    travelerNotes: [
      "Book arrival transport first, then confirm hotel check-in timing.",
      "For multi-city packages, keep the package order shown in the day-wise plan.",
      "Prices shown are per traveler where available and may vary by date, class, and seat."
    ]
  };

  return plain;
};

const enrichPackagesTravelOptions = async (packages) => Promise.all(packages.map(enrichPackageTravelOptions));

export const getPackages = async (req, res) => {
  try {
    const { category, type, destination, search } = req.query;
    if (!isDatabaseConnected()) {
      const packages = fallbackStore.getPackages({ category, type, destination, search });
      return res.json(packages);
    }
    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (type && type !== "all") filter.type = type;
    const text = destination || search;
    if (text) {
      const pattern = new RegExp(String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { destination: pattern },
        { title: pattern },
        { overview: pattern },
        { highlights: pattern },
        { bestFor: pattern }
      ];
    }
    const packages = await Package.find(filter).sort({ rating: -1, pricePerPerson: 1 });
    res.json(await enrichPackagesTravelOptions(packages));
  } catch (error) {
    res.status(500).json({ message: "Failed to search packages" });
  }
};

export const getPackageById = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const packages = fallbackStore.getPackages();
      const pkg = packages.find((p) => p._id === req.params.id);
      if (!pkg) return res.status(404).json({ message: "Package not found" });
      return res.json(pkg);
    }
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: "Package not found" });
    res.json(await enrichPackageTravelOptions(pkg));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch package details" });
  }
};

export const createCustomPackage = async (req, res) => {
  try {
    const { destination, days, budget, interests } = req.body;
    const customPkg = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: `Custom ${destination} Travel Experience`,
      destination: destination || "Jaipur",
      category: "Adventure",
      type: "Domestic",
      durationDays: Number(days) || 3,
      durationNights: (Number(days) || 3) - 1,
      pricePerPerson: Number(budget) || 12000,
      inclusions: ["Custom Hotel Stay", "Private Transport", "Curated Sightseeing", "24/7 Concierge"],
      travelOptions: {
        summary: `Custom travel plan for ${destination || "Jaipur"} with bus/train suggestions added after saving the route.`,
        busRoutes: [],
        trainRoutes: [],
        localTransfers: ["Private local transfers can be added for hotel pickup, sightseeing, and station/bus stand drop."],
        travelerNotes: ["Search buses/trains separately from the transport tabs for exact live route options."]
      },
      itinerary: Array.from({ length: Number(days) || 3 }).map((_, i) => ({
        day: i + 1,
        title: `Day ${i + 1}: ${destination} Exploration`,
        description: `Explore prime attractions tailored to your interest in ${interests || "culture & cuisine"}.`
      })),
      images: ["https://images.unsplash.com/photo-1599661046289-e31897846e41"],
      rating: 5.0
    };
    res.json(customPkg);
  } catch (error) {
    res.status(500).json({ message: "Failed to build custom package" });
  }
};
