import express from "express";
import { getRooms, createRoom, updateRoom, deleteRoom } from "../controllers/roomController.js";

const router = express.Router({ mergeParams: true });

router.route("/")
  .get(getRooms)
  .post(createRoom);

router.route("/:id")
  .put(updateRoom)
  .delete(deleteRoom);

export default router;
