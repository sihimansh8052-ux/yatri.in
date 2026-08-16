import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Hotel from "../models/Hotel.js";
import Restaurant from "../models/Restaurant.js";
import TouristPlace from "../models/TouristPlace.js";
import Room from "../models/Room.js";
import Bus from "../models/Bus.js";
import Package from "../models/Package.js";
import User from "../models/User.js";
import { fallbackStore } from "./fallbackStore.js";
import { hotelSeeds, placeSeeds, restaurantSeeds } from "./sampleData.js";

dotenv.config();

const users = [
  {
    name: "Demo Traveler",
    email: "demo@yatri.in",
    mobile: "+919999999001",
    password: "password123",
    role: "traveler",
    country: "India",
    state: "Delhi",
    city: "New Delhi",
    isEmailVerified: true,
    interests: ["food", "culture"]
  },
  {
    name: "Yatri Admin",
    email: "admin@yatri.in",
    mobile: "+919999999002",
    password: "password123",
    role: "admin",
    country: "India",
    state: "Delhi",
    city: "New Delhi",
    isEmailVerified: true,
    interests: ["food", "culture", "adventure"]
  },
  {
    name: "Asha Sharma",
    email: "asha@yatri.in",
    mobile: "+919876543210",
    password: "password123",
    role: "tour_guide",
    country: "India",
    state: "Delhi",
    city: "New Delhi",
    profilePhoto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
    experience: 5,
    pricePerDay: 1800,
    languagesSpoken: ["English", "Hindi"],
    rating: 4.9,
    availability: true,
    bio: "Expert in Old Delhi history, food walks, and local hidden markets. I offer heritage and custom photography tours.",
    isEmailVerified: true
  },
  {
    name: "Vikram Singh",
    email: "vikram@yatri.in",
    mobile: "+919876543211",
    password: "password123",
    role: "tour_guide",
    country: "India",
    state: "Uttar Pradesh",
    city: "Agra",
    profilePhoto: "https://images.unsplash.com/photo-1560250097-0b93528c311a",
    experience: 8,
    pricePerDay: 2500,
    languagesSpoken: ["English", "French"],
    rating: 4.8,
    availability: true,
    bio: "Taj Mahal and Mughal Empire history expert. Licensed guide with 8+ years showing the heritage of Agra.",
    isEmailVerified: true
  },
  {
    name: "Rajesh Kumar",
    email: "rajesh@yatri.in",
    mobile: "+919876543212",
    password: "password123",
    role: "tour_guide",
    country: "India",
    state: "Rajasthan",
    city: "Jaipur",
    profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    experience: 10,
    pricePerDay: 2200,
    languagesSpoken: ["English", "Hindi", "Spanish"],
    rating: 4.7,
    availability: true,
    bio: "Forts, palaces, and Rajasthani culture. I help curate heritage walks, shopping tours, and camel safaris.",
    isEmailVerified: true
  }
];

const insertIfEmpty = async (model, docs, label) => {
  const count = await model.countDocuments();
  if (count > 0) {
    console.log(`${label}: kept ${count} existing`);
    return;
  }
  await model.insertMany(docs);
  console.log(`${label}: inserted ${docs.length}`);
};

const insertUsersIfEmpty = async () => {
  const count = await User.countDocuments();
  if (count > 0) {
    console.log(`users: kept ${count} existing`);
    return;
  }
  const hashedUsers = await Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 10)
    }))
  );
  await User.insertMany(hashedUsers);
  console.log(`users: inserted ${hashedUsers.length}`);
};

const seedIfEmpty = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.error("MongoDB is unavailable.");
    process.exit(1);
  }

  await insertIfEmpty(Hotel, hotelSeeds, "hotels");
  await insertIfEmpty(Restaurant, restaurantSeeds, "restaurants");
  await insertIfEmpty(TouristPlace, placeSeeds, "places");
  await insertIfEmpty(Bus, fallbackStore.getBuses(), "buses");
  const packageSeeds = fallbackStore.getPackages().map(({ _id, ...item }) => item);
  await insertIfEmpty(Package, packageSeeds, "packages");

  const roomSeeds = hotelSeeds.flatMap((hotel) => [
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
  ]);
  await insertIfEmpty(Room, roomSeeds, "rooms");
  await insertUsersIfEmpty();

  await mongoose.connection.close();
};

seedIfEmpty();
