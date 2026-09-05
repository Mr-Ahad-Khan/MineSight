const asyncHandler = require("express-async-handler");
const Inspection = require("../models/Inspection");
const Mine = require("../models/Mine");
const Alert = require("../models/Alert");
const { calculateRiskScore, getRiskLevel } = require("../utils/riskCalculator");
const {
  getStoredMediaPath,
  serializeInspectionMedia,
} = require("../utils/mediaStorage");

const parseFormDataValue = (value, fallback = null) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed;
    } catch (error) {
      return value;
    }
  }

  return value;
};

// @desc    Get all inspections
// @route   GET /api/inspections
// @access  Private
const getInspections = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = {};

  // Role based filtering
  if (req.user.role === "mine_official" && req.user.mineId) {
    query.mineId = req.user.mineId;
  } else if (req.query.mineId) {
    query.mineId = req.query.mineId;
  }

  if (req.query.status) query.status = req.query.status;
  if (req.query.severity) query.severity = req.query.severity;
  if (req.query.type) query.type = req.query.type;

  const total = await Inspection.countDocuments(query);
  const inspections = await Inspection.find(query)
    .populate("mineId", "name code subsidiary")
    .populate("inspectorId", "name email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: inspections.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: inspections.map(serializeInspectionMedia),
  });
});

// @desc    Get single inspection
// @route   GET /api/inspections/:id
// @access  Private
const getInspectionById = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findById(req.params.id)
    .populate("mineId", "name code subsidiary location")
    .populate("inspectorId", "name email phone");

  if (!inspection) {
    res.status(404);
    throw new Error("Inspection not found");
  }

  res.json({
    success: true,
    data: serializeInspectionMedia(inspection),
  });
});

// @desc    Create new inspection (supports offlineId)
// @route   POST /api/inspections
// @access  Private
const createInspection = asyncHandler(async (req, res) => {
  const parsedBody = req.body || {};

  const mineId = parsedBody.mineId;
  const type = parsedBody.type;
  const title = parsedBody.title;
  const description = parsedBody.description;
  const coordinates = parseFormDataValue(parsedBody.coordinates, null);
  const observations = parsedBody.observations;
  const severity = parsedBody.severity;
  const violations = parseFormDataValue(parsedBody.violations, []) || [];
  const existingPhotos = parseFormDataValue(parsedBody.photos, []) || [];
  const offlineId = parsedBody.offlineId;
  const uploadedPhotos = (req.files?.photos || []).map(getStoredMediaPath);
  const photos = [...existingPhotos, ...uploadedPhotos].filter(Boolean);
  const audio = req.files?.audio?.[0]
    ? getStoredMediaPath(req.files.audio[0])
    : parseFormDataValue(parsedBody.audio, null);

  if (!mineId || !title) {
    res.status(400);
    throw new Error("Please provide mineId and title");
  }

  // Check if offlineId already exists (prevent duplicate offline sync)
  if (offlineId) {
    const existing = await Inspection.findOne({ offlineId });
    if (existing) {
      return res.json({
        success: true,
        message: "Already synced",
        data: existing,
      });
    }
  }

  const inspectionData = {
    mineId,
    inspectorId: req.user._id,
    type: type || "scheduled",
    title,
    description,
    observations,
    severity: severity || "medium",
    violations: violations || [],
    photos: photos || [],
    audio,
    offlineId,
  };

  if (coordinates && coordinates.length === 2) {
    inspectionData.location = {
      type: "Point",
      coordinates,
    };
  }

  // Calculate risk score
  inspectionData.riskScore = calculateRiskScore(inspectionData);

  const inspection = await Inspection.create(inspectionData);

  // Create alert if high risk
  if (inspection.riskScore >= 60) {
    await Alert.create({
      mineId,
      type: "high_risk",
      title: `High Risk Inspection: ${title}`,
      message: `Risk Score: ${inspection.riskScore}. Immediate attention required.`,
      severity: inspection.riskScore >= 80 ? "critical" : "warning",
      relatedInspection: inspection._id,
      assignedTo: req.user._id,
    });
  }

  // Update mine risk level if needed
  const mine = await Mine.findById(mineId);
  if (mine) {
    const recentHighRisk = await Inspection.countDocuments({
      mineId,
      riskScore: { $gte: 60 },
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    if (recentHighRisk >= 3) {
      mine.riskLevel = "high";
    } else if (recentHighRisk >= 1) {
      mine.riskLevel = "medium";
    }
    await mine.save();
  }

  const populated = await Inspection.findById(inspection._id)
    .populate("mineId", "name code")
    .populate("inspectorId", "name");

  res.status(201).json({
    success: true,
    data: serializeInspectionMedia(populated),
  });
});

// @desc    Update inspection (close, escalate, add violations)
// @route   PUT /api/inspections/:id
// @access  Private
const updateInspection = asyncHandler(async (req, res) => {
  let inspection = await Inspection.findById(req.params.id);

  if (!inspection) {
    res.status(404);
    throw new Error("Inspection not found");
  }

  // Recalculate risk if violations or severity changed
  if (req.body.violations || req.body.severity) {
    const temp = {
      severity: req.body.severity || inspection.severity,
      violations: req.body.violations || inspection.violations,
    };
    req.body.riskScore = calculateRiskScore(temp);
  }

  // If status is closed
  if (req.body.status === "closed" && inspection.status !== "closed") {
    req.body.closedAt = Date.now();
  }

  inspection = await Inspection.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("mineId", "name code")
    .populate("inspectorId", "name");

  // Create escalation alert
  if (req.body.status === "escalated") {
    await Alert.create({
      mineId: inspection.mineId,
      type: "escalation",
      title: `Inspection Escalated: ${inspection.title}`,
      message: `Inspection has been escalated for higher attention.`,
      severity: "critical",
      relatedInspection: inspection._id,
    });
  }

  res.json({
    success: true,
    data: serializeInspectionMedia(inspection),
  });
});

// @desc    Delete inspection
// @route   DELETE /api/inspections/:id
// @access  Private
const deleteInspection = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findById(req.params.id);

  if (!inspection) {
    res.status(404);
    throw new Error("Inspection not found");
  }

  await inspection.deleteOne();

  res.json({
    success: true,
    message: "Inspection deleted successfully",
    data: { id: req.params.id },
  });
});

// @desc    Close a specific violation inside inspection
// @route   PATCH /api/inspections/:id/violations/:violationId
// @access  Private
const closeViolation = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findById(req.params.id);

  if (!inspection) {
    res.status(404);
    throw new Error("Inspection not found");
  }

  const violation = inspection.violations.id(req.params.violationId);
  if (!violation) {
    res.status(404);
    throw new Error("Violation not found");
  }

  violation.status = "closed";
  violation.closedAt = Date.now();

  // Recalculate risk
  inspection.riskScore = calculateRiskScore(inspection);
  await inspection.save();

  res.json({
    success: true,
    data: serializeInspectionMedia(inspection),
  });
});

module.exports = {
  getInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection,
  closeViolation,
};
