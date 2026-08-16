import express from "express";
import { getUsers, updateUserRole, deleteUser, getBookings, updateBooking, deleteBooking, getRevenueSummary } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.route("/users").get(getUsers);
router.route("/users/:id")
  .patch(updateUserRole)
  .delete(deleteUser);

router.route("/bookings").get(getBookings);
router.route("/revenue").get(getRevenueSummary);
router.route("/bookings/:id")
  .patch(updateBooking)
  .delete(deleteBooking);

export default router;
