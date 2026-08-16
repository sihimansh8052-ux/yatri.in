import Train from "../models/Train.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const addMatchStatus = (trains) => trains.map((train) => ({ ...train, routeMatch: "exact" }));

export const getTrains = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!isDatabaseConnected()) {
      return res.json(addMatchStatus(fallbackStore.getTrains({ from, to })));
    }

    const filter = {};
    if (from) {
      const fromPattern = new RegExp(escapeRegex(from), "i");
      filter.$or = [{ from: fromPattern }, { boardingStations: fromPattern }];
    }
    if (to) {
      const toPattern = new RegExp(escapeRegex(to), "i");
      filter.$and = [...(filter.$and || []), { $or: [{ to: toPattern }, { droppingStations: toPattern }] }];
    }

    const trains = await Train.find(filter).sort({ rating: -1, price: 1 }).lean();
    res.json(addMatchStatus(trains));
  } catch (error) {
    res.status(500).json({ message: "Failed to search trains" });
  }
};

export const getTrainById = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const train = fallbackStore.getTrains().find((item) => item._id === req.params.id);
      if (!train) return res.status(404).json({ message: "Train not found" });
      return res.json(train);
    }

    const train = await Train.findById(req.params.id);
    if (!train) return res.status(404).json({ message: "Train not found" });
    res.json(train);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch train details" });
  }
};
