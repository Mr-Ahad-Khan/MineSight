const express = require("express");
const router = express.Router();
const {
  getAttendance,
  getRealtimeAttendance,
  markCheckIn,
  markCheckOut,
  updateLiveStatus,
} = require("../controllers/attendanceController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/realtime", getRealtimeAttendance);
router.get("/", getAttendance);
router.post("/check-in", markCheckIn);
router.post("/:id/check-out", markCheckOut);
router.patch("/:id/live-status", updateLiveStatus);

module.exports = router;
