import mongoose from "mongoose";

let databaseConnected = false;

export const isDatabaseConnected = () => databaseConnected;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/yatriin";
  try {
    await mongoose.connect(uri, { family: 4 });
    databaseConnected = true;
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    databaseConnected = false;
    console.error("MongoDB connection failed", error.message);
    return false;
  }
};
