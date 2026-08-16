import express from "express";
import { getPackages, getPackageById, createCustomPackage } from "../controllers/packageController.js";

const router = express.Router();

router.get("/", getPackages);
router.post("/custom", createCustomPackage);
router.get("/:id", getPackageById);

export default router;
