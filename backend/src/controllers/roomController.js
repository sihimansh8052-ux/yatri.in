import Room from "../models/Room.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";

import mongoose from "mongoose";

const toValidObjectId = (str) => {
  if (!str) return new mongoose.Types.ObjectId();
  if (mongoose.Types.ObjectId.isValid(str)) {
    return new mongoose.Types.ObjectId(str);
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let result = "";
  for (let i = 0; i < 12; i++) {
    const value = (hash >> (i * 2)) & 0xFF;
    result += ("00" + value.toString(16)).slice(-2);
  }
  return new mongoose.Types.ObjectId((result + "1234567890abcdef").slice(0, 24));
};

const getMockRoomsForHotel = (hotelId) => {
  return [
    {
      _id: toValidObjectId(`std-${hotelId}`),
      hotel: hotelId,
      type: "Standard Room",
      pricePerNight: 2800,
      capacity: 2,
      beds: 1,
      facilities: ["Free Wi-Fi", "Air Conditioning", "Breakfast Included"],
      images: ["https://images.unsplash.com/photo-1611891487122-2075b9624428"],
      availability: true
    },
    {
      _id: toValidObjectId(`dlx-${hotelId}`),
      hotel: hotelId,
      type: "Deluxe Room",
      pricePerNight: 4300,
      capacity: 2,
      beds: 1,
      facilities: ["Free Wi-Fi", "Air Conditioning", "Swimming Pool", "Breakfast Included"],
      images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd"],
      availability: true
    },
    {
      _id: toValidObjectId(`ste-${hotelId}`),
      hotel: hotelId,
      type: "Luxury Suite",
      pricePerNight: 7500,
      capacity: 4,
      beds: 2,
      facilities: ["Free Wi-Fi", "Air Conditioning", "Swimming Pool", "Parking", "Breakfast Included"],
      images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a"],
      availability: true
    }
  ];
};

export const getRooms = async (req, res) => {
  const { hotelId } = req.params;
  if (!isDatabaseConnected()) {
    const rooms = fallbackStore.getCollection("rooms").filter((r) => r.hotel === hotelId);
    if (rooms.length > 0) return res.json(rooms);
    return res.json(getMockRoomsForHotel(hotelId));
  }
  try {
    const rooms = await Room.find({ hotel: mongoose.Types.ObjectId.isValid(hotelId) ? hotelId : toValidObjectId(hotelId) });
    if (rooms.length > 0) return res.json(rooms);
    return res.json(getMockRoomsForHotel(hotelId));
  } catch (error) {
    return res.json(getMockRoomsForHotel(hotelId));
  }
};

export const createRoom = async (req, res) => {
  const { hotelId } = req.params;
  if (!isDatabaseConnected()) {
    const room = fallbackStore.createListing("rooms", { ...req.body, hotel: hotelId });
    return res.status(201).json(room);
  }
  try {
    const room = await Room.create({ ...req.body, hotel: hotelId });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: "Failed to create room layout" });
  }
};

export const updateRoom = async (req, res) => {
  const { id } = req.params;
  if (!isDatabaseConnected()) {
    const room = fallbackStore.updateListing("rooms", id, req.body);
    if (!room) return res.status(404).json({ message: "Room not found" });
    return res.json(room);
  }
  try {
    const room = await Room.findByIdAndUpdate(id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Failed to update room layout" });
  }
};

export const deleteRoom = async (req, res) => {
  const { id } = req.params;
  if (!isDatabaseConnected()) {
    const deleted = fallbackStore.deleteListing("rooms", id);
    if (!deleted) return res.status(404).json({ message: "Room not found" });
    return res.json({ message: "Room removed" });
  }
  try {
    const room = await Room.findByIdAndDelete(id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete room" });
  }
};
