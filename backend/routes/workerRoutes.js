const express = require("express");
const {
  getWorkerSummary,
  markAttendance,
  createWorkerTask,
  updateWorkerTask,
} = require("../controllers/workerController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get(
  "/summary",
  authorize("admin", "corporate", "mine_official", "worker"),
  getWorkerSummary,
);
router.post(
  "/attendance",
  authorize("admin", "corporate", "mine_official", "worker"),
  markAttendance,
);
router.post(
  "/tasks",
  authorize("admin", "corporate", "mine_official"),
  createWorkerTask,
);
router.patch(
  "/tasks/:id",
  authorize("admin", "corporate", "mine_official", "worker"),
  updateWorkerTask,
);

module.exports = router;
