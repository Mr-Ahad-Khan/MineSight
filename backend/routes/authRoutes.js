const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  requestEmailOtp,
  verifyEmailOtp,
  registerUser,
  loginUser,
  getMe,
  updateProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { createMediaStorage } = require("../utils/mediaStorage");

const profileUpload = multer({
  storage: createMediaStorage("profiles"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

router.post("/register", registerUser);
router.post("/email/request-otp", requestEmailOtp);
router.post("/email/verify-otp", verifyEmailOtp);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put(
  "/profile",
  protect,
  profileUpload.single("profilePicture"),
  updateProfile,
);

module.exports = router;
