import express from "express";
import {
  forgotPassword,
  googleSignIn,
  gitHubSignIn,
  login,
  logout,
  me,
  refresh,
  requestEmailOtp,
  requestMobileOtp,
  resetPassword,
  signup,
  verifyEmailOtp
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleSignIn);
router.post("/github", gitHubSignIn);
router.post("/email-otp/request", requestEmailOtp);
router.post("/email-otp/verify", verifyEmailOtp);
router.post("/mobile-otp/request", requestMobileOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me);

export default router;
