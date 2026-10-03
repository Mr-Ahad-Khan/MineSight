const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Inspection = require("../models/Inspection");
const Mine = require("../models/Mine");
const Alert = require("../models/Alert");
const AuditLog = require("../models/AuditLog");
const { calculateRiskScore, getRiskLevel, detectPhotoRiskBackend } = require("../utils/riskCalculator");
const { appendAuditBlock, verifyAuditChain } = require("../utils/auditChain");
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

const toAuditSnapshot = (inspection) => ({
  mineId: String(inspection.mineId?._id || inspection.mineId),
  inspectorId: String(inspection.inspectorId?._id || inspection.inspectorId),
  type: inspection.type,
  title: inspection.title,
  description: inspection.description,
  observations: inspection.observations,
  status: inspection.status,
  severity: inspection.severity,
  riskScore: inspection.riskScore,
  violations: (inspection.violations || []).map((violation) => ({
    id: violation._id ? String(violation._id) : null,
    description: violation.description,
    category: violation.category,
    severity: violation.severity,
    status: violation.status,
    correctiveAction: violation.correctiveAction,
    dueDate: violation.dueDate ? new Date(violation.dueDate).toISOString() : null,
    closedAt: violation.closedAt ? new Date(violation.closedAt).toISOString() : null,
  })),
  createdAt: inspection.createdAt ? new Date(inspection.createdAt).toISOString() : null,
  closedAt: inspection.closedAt ? new Date(inspection.closedAt).toISOString() : null,
});

// @desc    Get all inspections
// @route   GET /api/inspections
// @access  Private
const getInspections = asyncHandler(async (req, res) => {
  const requestedPage = Number.parseInt(req.query.page, 10);
  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 100)
    : 20;
  const skip = (page - 1) * limit;

  let query = {};

  // Role based filtering
  if (req.user.role === "mine_official" && req.user.mineId) {
    query.mineId = req.user.mineId;
  } else if (req.query.mineId) {
    if (!mongoose.Types.ObjectId.isValid(req.query.mineId)) {
      res.status(400);
      throw new Error("Invalid mineId");
    }
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
    .sort({ createdAt: -1 })
    .lean();

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

const getInspectionAuditHistory = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findById(req.params.id).select("mineId");
  if (!inspection) {
    res.status(404);
    throw new Error("Inspection not found");
  }

  if (
    req.user.role === "mine_official" &&
    req.user.mineId &&
    String(inspection.mineId) !== String(req.user.mineId)
  ) {
    res.status(403);
    throw new Error("You are not allowed to view this inspection audit trail");
  }

  const [integrity, blocks] = await Promise.all([
    verifyAuditChain(),
    AuditLog.find({
      entityType: "Inspection",
      entityId: inspection._id,
      sequence: { $exists: true },
    })
      .populate("userId", "name email")
      .sort({ sequence: -1 })
      .lean(),
  ]);

  res.json({ success: true, data: { integrity, blocks } });
});

// @desc    Create new inspection (supports offlineId)
// @route   POST /api/inspections
// @access  Private
const createInspection = asyncHandler(async (req, res) => {
  const parsedBody = req.body || {};

  const mineId = parsedBody.mineId;
  const type = parsedBody.type;
  const title = parsedBody.title;
  const description =
    parsedBody.description !== undefined && parsedBody.description !== null
      ? String(parsedBody.description).trim()
      : "";
  const coordinates = parseFormDataValue(parsedBody.coordinates, null);
  const observations =
    parsedBody.observations !== undefined && parsedBody.observations !== null
      ? String(parsedBody.observations).trim()
      : "";
  const severity = parsedBody.severity;
  const violations = parseFormDataValue(parsedBody.violations, []) || [];
  const existingPhotosValue = parseFormDataValue(parsedBody.photos, []);
  const existingPhotos = (Array.isArray(existingPhotosValue)
    ? existingPhotosValue
    : [existingPhotosValue]
  ).filter((photo) => typeof photo === "string" && photo.trim());
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
    closurePhotos: [],
    proofVerified: false,
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

  // Background side-effects to keep createInspection ultra fast
  if (inspection.riskScore >= 60) {
    Alert.create({
      mineId,
      type: "high_risk",
      title: `High Risk Inspection: ${title}`,
      message: `Risk Score: ${inspection.riskScore}. Immediate attention required.`,
      severity: inspection.riskScore >= 80 ? "critical" : "warning",
      relatedInspection: inspection._id,
      assignedTo: req.user._id,
    }).catch((err) => console.error("High risk alert creation error:", err));
  }

  Mine.findById(mineId)
    .then(async (mine) => {
      if (!mine) return;
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
    })
    .catch((err) => console.error("Mine risk level update error:", err));

  // Run audit and populate concurrently
  await Promise.all([
    appendAuditBlock({
      userId: req.user._id,
      action: "INSPECTION_CREATED",
      entityType: "Inspection",
      entityId: inspection._id,
      newValue: toAuditSnapshot(inspection),
      ip: req.ip,
    }).catch((err) => console.error("Audit log error:", err)),
    inspection.populate([
      { path: "mineId", select: "name code" },
      { path: "inspectorId", select: "name" },
    ]),
  ]);

  res.status(201).json({
    success: true,
    data: serializeInspectionMedia(inspection),
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

  const oldValue = toAuditSnapshot(inspection);

  // Recalculate risk if violations or severity changed
  if (req.body.violations || req.body.severity) {
    const temp = {
      severity: req.body.severity || inspection.severity,
      violations: req.body.violations || inspection.violations,
    };
    req.body.riskScore = calculateRiskScore(temp);
  }

  const uploadedPhotos = (req.files?.photos || []).map(getStoredMediaPath);
  const submittedPhotos = parseFormDataValue(req.body.photos, null);
  const isClosureProof =
    req.body.isClosureProof === "true" ||
    req.body.isClosureProof === true ||
    (uploadedPhotos.length > 0 &&
      (req.body.status === "closed" || inspection.status === "closed"));

  if (isClosureProof && uploadedPhotos.length > 0) {
    const currentClosure = Array.isArray(inspection.closurePhotos)
      ? inspection.closurePhotos
      : [];
    req.body.closurePhotos = [...currentClosure, ...uploadedPhotos].slice(0, 10);
    req.body.proofVerified = true;
  }

  if (submittedPhotos !== null || uploadedPhotos.length) {
    const existingPhotos = (inspection.photos || []).filter(
      (photo) => typeof photo === "string" && photo.trim(),
    );
    const requestedPhotos = (Array.isArray(submittedPhotos)
      ? submittedPhotos
      : [submittedPhotos]
    ).filter((photo) => typeof photo === "string" && photo.trim());
    req.body.photos = [
      ...(submittedPhotos === null ? existingPhotos : requestedPhotos),
      ...uploadedPhotos,
    ].slice(0, 10);
  }

  // If status is closed
  if (req.body.status === "closed" && inspection.status !== "closed") {
    req.body.closedAt = Date.now();
  } else if (req.body.status === "open") {
    req.body.closedAt = null;
    req.body.proofVerified = false;
  }

  inspection = await Inspection.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("mineId", "name code")
    .populate("inspectorId", "name");

  await appendAuditBlock({
    userId: req.user._id,
    action: "INSPECTION_UPDATED",
    entityType: "Inspection",
    entityId: inspection._id,
    oldValue,
    newValue: toAuditSnapshot(inspection),
    ip: req.ip,
  });

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

  const oldValue = toAuditSnapshot(inspection);
  await Alert.deleteMany({ relatedInspection: inspection._id });
  await inspection.deleteOne();
  await appendAuditBlock({
    userId: req.user._id,
    action: "INSPECTION_DELETED",
    entityType: "Inspection",
    entityId: inspection._id,
    oldValue,
    ip: req.ip,
  });

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

  const oldValue = toAuditSnapshot(inspection);
  violation.status = "closed";
  violation.closedAt = Date.now();

  // Recalculate risk
  inspection.riskScore = calculateRiskScore(inspection);
  await inspection.save();
  await appendAuditBlock({
    userId: req.user._id,
    action: "INSPECTION_VIOLATION_CLOSED",
    entityType: "Inspection",
    entityId: inspection._id,
    oldValue,
    newValue: toAuditSnapshot(inspection),
    ip: req.ip,
  });

  res.json({
    success: true,
    data: serializeInspectionMedia(inspection),
  });
});

// @desc    Detect safety and operational risk from photo
// @route   POST /api/inspections/detect-risk
// @access  Private
const detectRiskFromPhoto = asyncHandler(async (req, res) => {
  const photo = req.files?.photos?.[0] || req.file;
  const context = {
    mineId: req.body?.mineId,
    title: req.body?.title,
    description: req.body?.description,
    observations: req.body?.observations,
    severity: req.body?.severity,
  };

  const analysis = await detectPhotoRiskBackend({
    file: photo,
    context,
  });

  res.json({
    success: true,
    data: analysis,
  });
});

module.exports = {
  getInspections,
  getInspectionById,
  getInspectionAuditHistory,
  createInspection,
  updateInspection,
  deleteInspection,
  closeViolation,
  detectRiskFromPhoto,
};
