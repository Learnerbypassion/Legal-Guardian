const express = require("express");
const {
  register,
  verifyOTP,
  resendOTPHandler,
  login,
  getCurrentUser,
  logout,
  forgotPasswordHandler,
  verifyResetOTPHandler,
  resetPasswordHandler,
  resendResetOTPHandler,
  updateProfile,
} = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTPHandler);
router.post("/login", login);

// Forgot Password routes
router.post("/forgot-password", forgotPasswordHandler);
router.post("/verify-reset-otp", verifyResetOTPHandler);
router.post("/reset-password", resetPasswordHandler);
router.post("/resend-reset-otp", resendResetOTPHandler);

// Protected routes
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", authenticate, logout);
router.put("/profile", authenticate, updateProfile);

module.exports = router;
