import Bus from "../models/Bus.js";
import { isDatabaseConnected } from "../config/db.js";
import { fallbackStore } from "../data/fallbackStore.js";

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const addMatchStatus = (buses) => buses.map((bus) => ({ ...bus, routeMatch: "exact" }));

export const getBuses = async (req, res) => {
  try {
    const { from, to, city, search } = req.query;
    const destination = city || search;
    if (!isDatabaseConnected()) {
      const exactBuses = fallbackStore.getBuses({ from, to: to || destination });
      return res.json(addMatchStatus(exactBuses));
    }
    const filter = {};
    if (from) {
      const fromPattern = new RegExp(escapeRegex(from), "i");
      filter.$or = [{ from: fromPattern }, { boardingPoints: fromPattern }];
    }
    if (to) {
      const toPattern = new RegExp(escapeRegex(to), "i");
      const toOr = [{ to: toPattern }, { droppingPoints: toPattern }];
      filter.$and = [...(filter.$and || []), { $or: toOr }];
    }
    if (destination && !to && !from) {
      const destinationPattern = new RegExp(escapeRegex(destination), "i");
      filter.$or = [
        { from: destinationPattern },
        { to: destinationPattern },
        { boardingPoints: destinationPattern },
        { droppingPoints: destinationPattern },
        { operatorName: destinationPattern },
        { busType: destinationPattern }
      ];
    }
    const exactBuses = await Bus.find(filter).sort({ rating: -1, price: 1 }).lean();
    res.json(addMatchStatus(exactBuses));
  } catch (error) {
    res.status(500).json({ message: "Failed to search buses" });
  }
};

export const getBusById = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const buses = fallbackStore.getBuses();
      const bus = buses.find((b) => b._id === req.params.id);
      if (!bus) return res.status(404).json({ message: "Bus not found" });
      return res.json(bus);
    }
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Bus not found" });
    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bus details" });
  }
};
