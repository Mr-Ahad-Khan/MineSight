const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  getInspections,
  getInspectionById,
  getInspectionAuditHistory,
  createInspection,
  updateInspection,
  deleteInspection,
  closeViolation,
  detectRiskFromPhoto,
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

const handleInspectionUpload = (req, res, next) => {
  inspectionUpload.any()(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File is too large. Maximum allowed size is 25MB.",
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }

    // Normalize req.files to dictionary { photos: [], audio: [] }
    if (Array.isArray(req.files)) {
      const filesMap = { photos: [], audio: [] };
      for (const file of req.files) {
        if (file.fieldname === "photos") {
          filesMap.photos.push(file);
        } else if (file.fieldname === "audio") {
          filesMap.audio.push(file);
        } else if (file.mimetype && file.mimetype.startsWith("audio/")) {
          filesMap.audio.push(file);
        } else {
          filesMap.photos.push(file);
        }
      }
      req.files = filesMap;
    }

    next();
  });
};

router.use(protect);

router
  .route("/")
  .get(getInspections)
  .post(handleInspectionUpload, createInspection);

router.post("/detect-risk", handleInspectionUpload, detectRiskFromPhoto);

router.get("/:id/audit", getInspectionAuditHistory);

router
  .route("/:id")
  .get(getInspectionById)
  .put(handleInspectionUpload, updateInspection)
  .delete(deleteInspection);

router.patch("/:id/violations/:violationId", closeViolation);

module.exports = router;
