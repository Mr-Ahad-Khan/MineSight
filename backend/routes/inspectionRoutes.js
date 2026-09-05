const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  getInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection,
  closeViolation,
} = require("../controllers/inspectionController");
const { protect } = require("../middleware/auth");
const { createMediaStorage } = require("../utils/mediaStorage");

const inspectionUpload = multer({
  storage: createMediaStorage("inspections"),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("audio/") ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
      return;
    }

    cb(new Error("Only image and audio files are allowed"));
  },
});

router.use(protect);

router
  .route("/")
  .get(getInspections)
  .post(
    inspectionUpload.fields([
      { name: "audio", maxCount: 1 },
      { name: "photos", maxCount: 5 },
    ]),
    createInspection,
  );

router
  .route("/:id")
  .get(getInspectionById)
  .put(updateInspection)
  .delete(deleteInspection);

router.patch("/:id/violations/:violationId", closeViolation);

module.exports = router;
