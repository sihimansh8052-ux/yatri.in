import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    destination: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ["Family", "Honeymoon", "Adventure", "Religious", "Luxury", "Budget"],
      default: "Family"
    },
    type: { type: String, enum: ["Domestic", "International"], default: "Domestic" },
    durationDays: { type: Number, required: true },
    durationNights: { type: Number, required: true },
    pricePerPerson: { type: Number, required: true },
    overview: String,
    highlights: [{ type: String }],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    bestFor: [{ type: String }],
    mealPlan: String,
    transport: String,
    stayCategory: String,
    travelOptions: {
      summary: String,
      busRoutes: [
        {
          operatorName: String,
          busType: String,
          from: String,
          to: String,
          departureTime: String,
          arrivalTime: String,
          duration: String,
          price: Number,
          boardingPoints: [String],
          droppingPoints: [String]
        }
      ],
      trainRoutes: [
        {
          trainNumber: String,
          trainName: String,
          trainType: String,
          from: String,
          to: String,
          departureTime: String,
          arrivalTime: String,
          duration: String,
          price: Number,
          boardingStations: [String],
          droppingStations: [String],
          classes: [String]
        }
      ],
      localTransfers: [String],
      travelerNotes: [String]
    },
    itinerary: [
      {
        day: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String }
      }
    ],
    images: [{ type: String }],
    rating: { type: Number, default: 4.8 }
  },
  { timestamps: true }
);

export default mongoose.model("Package", packageSchema);
