import express from "express";
import { getTrainById, getTrains } from "../controllers/trainController.js";

const router = express.Router();

router.get("/", getTrains);
router.get("/:id", getTrainById);

export default router;
