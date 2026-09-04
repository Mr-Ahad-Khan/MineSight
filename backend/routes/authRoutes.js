const express = require("express");
const path = require("path");
const fs = require("fs");
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

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const profileUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase() || ".jpg";
      cb(
        null,
        `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`,
      );
    },
  }),
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
