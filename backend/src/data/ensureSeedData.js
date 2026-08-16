import bcrypt from "bcryptjs";
import Bus from "../models/Bus.js";
import Hotel from "../models/Hotel.js";
import Package from "../models/Package.js";
import Restaurant from "../models/Restaurant.js";
import Room from "../models/Room.js";
import TouristPlace from "../models/TouristPlace.js";
import Train from "../models/Train.js";
import User from "../models/User.js";
import { busSeeds, guideSeeds, hotelSeeds, packageSeeds, placeSeeds, restaurantSeeds, trainSeeds } from "./sampleData.js";

const upsertById = async (model, docs) => {
  for (const doc of docs) {
    await model.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });
  }
};

const roomSeedsForHotel = (hotel) => [
  {
    hotel: hotel._id,
    type: "Standard Room",
    pricePerNight: hotel.pricePerNight || 3200,
    capacity: 2,
    beds: 1,
    facilities: ["Free Wi-Fi", "Air Conditioning", "Breakfast Included"],
    images: ["https://images.unsplash.com/photo-1611891487122-2075b9624428"],
    availability: true
  },
  {
    hotel: hotel._id,
    type: "Deluxe Room",
    pricePerNight: (hotel.pricePerNight || 3200) + 1500,
    capacity: 2,
    beds: 1,
    facilities: ["Free Wi-Fi", "Air Conditioning", "Swimming Pool", "Breakfast Included"],
    images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd"],
    availability: true
  },
  {
    hotel: hotel._id,
    type: "Luxury Suite",
    pricePerNight: (hotel.pricePerNight || 3200) + 4000,
    capacity: 4,
    beds: 2,
    facilities: ["Free Wi-Fi", "Air Conditioning", "Swimming Pool", "Parking", "Breakfast Included"],
    images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a"],
    availability: true
  }
];

const syncRooms = async () => {
  for (const hotel of hotelSeeds) {
    for (const room of roomSeedsForHotel(hotel)) {
      await Room.updateOne({ hotel: hotel._id, type: room.type }, { $set: room }, { upsert: true });
    }
  }
};

const syncGuides = async () => {
  for (const guide of guideSeeds) {
    const existing = await User.findOne({ email: guide.email });
    const { _id, ...payload } = guide;
    if (!existing || !String(existing.password || "").startsWith("$2")) {
      payload.password = await bcrypt.hash(guide.password, 10);
    } else {
      delete payload.password;
    }
    await User.updateOne({ email: guide.email }, { $set: payload, $setOnInsert: { _id } }, { upsert: true });
  }
};

export const ensureSeedData = async () => {
  if (process.env.DISABLE_AUTO_SEED === "true") return;

  const [hotels, restaurants, places, buses, trains, packages] = await Promise.all([
    Hotel.countDocuments(),
    Restaurant.countDocuments(),
    TouristPlace.countDocuments(),
    Bus.countDocuments(),
    Train.countDocuments(),
    Package.countDocuments()
  ]);

  if (hotels && restaurants && places && buses && trains && packages) return;

  await upsertById(Hotel, hotelSeeds);
  await upsertById(Restaurant, restaurantSeeds);
  await upsertById(TouristPlace, placeSeeds);
  await upsertById(Bus, busSeeds);
  await upsertById(Train, trainSeeds);
  await upsertById(Package, packageSeeds);
  await syncRooms();
  await syncGuides();

  console.log("Seed data ensured for empty MongoDB collections");
};
