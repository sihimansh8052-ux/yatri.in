import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Bus from "../models/Bus.js";
import Hotel from "../models/Hotel.js";
import Package from "../models/Package.js";
import Restaurant from "../models/Restaurant.js";
import Room from "../models/Room.js";
import TouristPlace from "../models/TouristPlace.js";
import Train from "../models/Train.js";
import User from "../models/User.js";
import { busSeeds, guideSeeds, hotelSeeds, packageSeeds, placeSeeds, restaurantSeeds, trainSeeds } from "./sampleData.js";

dotenv.config();

const upsertById = async (model, docs, label) => {
  let upserted = 0;
  let updated = 0;

  for (const doc of docs) {
    const result = await model.updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true }
    );
    upserted += result.upsertedCount || 0;
    updated += result.modifiedCount || 0;
  }

  const total = await model.countDocuments();
  console.log(`${label}: ${total} total, ${upserted} inserted, ${updated} updated`);
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
  let upserted = 0;
  let updated = 0;

  for (const hotel of hotelSeeds) {
    for (const room of roomSeedsForHotel(hotel)) {
      const result = await Room.updateOne(
        { hotel: hotel._id, type: room.type },
        { $set: room },
        { upsert: true }
      );
      upserted += result.upsertedCount || 0;
      updated += result.modifiedCount || 0;
    }
  }

  const total = await Room.countDocuments();
  console.log(`rooms: ${total} total, ${upserted} inserted, ${updated} updated`);
};

const syncGuides = async () => {
  let upserted = 0;
  let updated = 0;

  for (const guide of guideSeeds) {
    const existing = await User.findOne({ email: guide.email });
    const { _id, ...payload } = guide;
    if (!existing || !String(existing.password || "").startsWith("$2")) {
      payload.password = await bcrypt.hash(guide.password, 10);
    } else {
      delete payload.password;
    }
    const result = await User.updateOne(
      { email: guide.email },
      { $set: payload, $setOnInsert: { _id } },
      { upsert: true }
    );
    upserted += result.upsertedCount || 0;
    updated += result.modifiedCount || 0;
  }

  const total = await User.countDocuments({ role: "tour_guide" });
  console.log(`guides: ${total} total, ${upserted} inserted, ${updated} updated`);
};

const syncSeedData = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.error("MongoDB is unavailable.");
    process.exit(1);
  }

  await upsertById(Hotel, hotelSeeds, "hotels");
  await upsertById(Restaurant, restaurantSeeds, "restaurants");
  await upsertById(TouristPlace, placeSeeds, "places");
  await upsertById(Bus, busSeeds, "buses");
  await upsertById(Train, trainSeeds, "trains");
  await upsertById(Package, packageSeeds, "packages");
  await syncRooms();
  await syncGuides();

  await mongoose.connection.close();
};

syncSeedData();
