import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Hotel from "../models/Hotel.js";
import Restaurant from "../models/Restaurant.js";
import TouristPlace from "../models/TouristPlace.js";
import Room from "../models/Room.js";
import Bus from "../models/Bus.js";
import Package from "../models/Package.js";
import User from "../models/User.js";
import { busSeeds, hotelSeeds, placeSeeds, restaurantSeeds } from "./sampleData.js";

dotenv.config();

const demoUser = {
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
};

const adminUser = {
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
};

const guideSeeds = [
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

const packageSeeds = [
  {
    _id: "680e75b20000000000000041",
    title: "Royal Rajasthan Heritage Experience",
    destination: "Jaipur",
    category: "Family",
    type: "Domestic",
    durationDays: 4,
    durationNights: 3,
    pricePerPerson: 14999,
    inclusions: ["4 Star Heritage Stay", "Private SUV Transit", "Licensed Local Guide", "Buffet Breakfast"],
    itinerary: [
      { day: 1, title: "Arrival & City Palace Walk", description: "Check in at heritage hotel, visit City Palace & Jantar Mantar." },
      { day: 2, title: "Amer Fort & Nahargarh Sunset", description: "Elephant ride at Amer Fort, photography at Jal Mahal, sunset view from Nahargarh." },
      { day: 3, title: "Local Bazaars & Craft Workshop", description: "Explore Johari Bazaar, block printing workshop, dinner at Chokhi Dhani." },
      { day: 4, title: "Albert Hall & Departure", description: "Morning visit to Albert Hall Museum and drop at Airport/Station." }
    ],
    images: ["https://images.unsplash.com/photo-1599661046289-e31897846e41"],
    rating: 4.9
  },
  {
    _id: "680e75b20000000000000042",
    title: "Kashmir Paradise Valley Tour",
    destination: "Srinagar",
    category: "Honeymoon",
    type: "Domestic",
    durationDays: 5,
    durationNights: 4,
    pricePerPerson: 22999,
    inclusions: ["Dal Lake Houseboat Stay", "Shikara Ride", "Gondola Ride Ticket", "All Meals"],
    itinerary: [
      { day: 1, title: "Srinagar Arrival & Houseboat Stay", description: "Check in to luxury houseboat, evening Shikara ride." },
      { day: 2, title: "Gulmarg Day Trip & Gondola Ride", description: "Scenic drive to Gulmarg, ride phase 1 Gondola cable car." },
      { day: 3, title: "Pahalgam Valley Excursion", description: "Visit Betaab Valley & Aru Valley, riverside picnic." },
      { day: 4, title: "Mughal Gardens Walk", description: "Explore Shalimar Bagh, Nishat Bagh, and local saffron market." },
      { day: 5, title: "Souvenir Shopping & Departure", description: "Morning handicraft shopping and airport transfer." }
    ],
    images: ["https://images.unsplash.com/photo-1598091383021-15ddea10925d"],
    rating: 4.95
  },
  {
    _id: "680e75b20000000000000043",
    title: "Magical Bali Beach Escape",
    destination: "Bali",
    category: "Honeymoon",
    type: "International",
    durationDays: 6,
    durationNights: 5,
    pricePerPerson: 45999,
    inclusions: ["Luxury Beachfront Villa", "Sunset Catamaran Cruise", "Scuba Diving Session", "Airport Pickup"],
    itinerary: [
      { day: 1, title: "Bali Arrival & Villa Check-in", description: "Private airport reception, flower garland welcome, villa relaxation." },
      { day: 2, title: "Ubud Rice Terraces & Monkey Forest", description: "Visit Tegallalang rice fields, jungle swing experience, Monkey Forest." },
      { day: 3, title: "Nusa Penida Island Tour", description: "Speedboat to Nusa Penida, visit Kelingking T-Rex cliff and Broken Beach." },
      { day: 4, title: "Tanah Lot Temple & Sunset", description: "Water sports at Tanjung Benoa, evening sunset at Tanah Lot sea temple." },
      { day: 5, title: "Balinese Spa & Sunset Cruise", description: "2-hour couple massage treatment followed by luxury evening dinner cruise." },
      { day: 6, title: "Seminyak Shopping & Departure", description: "Boutique shopping in Seminyak before airport transfer." }
    ],
    images: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4"],
    rating: 4.9
  }
];

const seed = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.error("MongoDB is unavailable. Start MongoDB before running the seed command.");
    process.exit(1);
  }
  await Promise.all([
    Hotel.deleteMany({}),
    Restaurant.deleteMany({}),
    TouristPlace.deleteMany({}),
    Room.deleteMany({}),
    Bus.deleteMany({}),
    Package.deleteMany({}),
    User.deleteMany({})
  ]);

  // Keep original IDs to align references correctly
  await Hotel.insertMany(hotelSeeds);
  await Restaurant.insertMany(restaurantSeeds);
  await TouristPlace.insertMany(placeSeeds);
  await Bus.insertMany(busSeeds);
  await Package.insertMany(packageSeeds);

  // Generate rooms seeds mapping to seeded hotel IDs
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
  await Room.insertMany(roomSeeds);

  await User.create(demoUser);
  await User.create(adminUser);
  for (const guide of guideSeeds) {
    await User.create(guide);
  }

  console.log("Seed data inserted");
  await mongoose.connection.close();
};

seed();
