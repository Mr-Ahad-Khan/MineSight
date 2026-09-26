const asyncHandler = require("express-async-handler");
const Attendance = require("../models/Attendance");
const Mine = require("../models/Mine");

// Helper to seed realistic demo attendance if none exist for today
const ensureDemoAttendanceIfEmpty = async (mineId) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const existingCount = await Attendance.countDocuments({
    createdAt: { $gte: startOfDay },
  });

  if (existingCount > 0) return;

  let targetMineId = mineId;
  if (!targetMineId) {
    const firstMine = await Mine.findOne();
    if (firstMine) targetMineId = firstMine._id;
  }
  if (!targetMineId) return;

  const demoWorkers = [
    {
      workerName: "Rameshwar Yadav",
      workerId: "CW-4081",
      role: "Miner",
      shift: "Shift A (Morning)",
      zone: "Pit-1 Underground Face",
      status: "present",
      liveStatus: "inside_mine",
      safetyGearVerified: true,
      bodyTemp: 36.6,
      emergencyContact: "+91 98351 22341",
      checkIn: new Date(Date.now() - 4 * 3600 * 1000),
      notes: "Operating extraction drift #4",
    },
    {
      workerName: "Vikramjit Singh",
      workerId: "CW-4082",
      role: "Blaster",
      shift: "Shift A (Morning)",
      zone: "Pit-1 Underground Face",
      status: "present",
      liveStatus: "inside_mine",
      safetyGearVerified: true,
      bodyTemp: 36.4,
      emergencyContact: "+91 94311 88921",
      checkIn: new Date(Date.now() - 3.5 * 3600 * 1000),
      notes: "Handling controlled blast prep",
    },
    {
      workerName: "Sunil Soren",
      workerId: "CW-4083",
      role: "Safety Officer",
      shift: "Shift A (Morning)",
      zone: "Ventilation Shaft 3",
      status: "present",
      liveStatus: "inside_mine",
      safetyGearVerified: true,
      bodyTemp: 36.8,
      emergencyContact: "+91 91234 56789",
      checkIn: new Date(Date.now() - 5 * 3600 * 1000),
      notes: "Conducting air quality & methane test",
    },
    {
      workerName: "Amitabh Kumar",
      workerId: "CW-4084",
      role: "Heavy Equipment Operator",
      shift: "Shift A (Morning)",
      zone: "Pit-2 Open Cast West",
      status: "present",
      liveStatus: "surface_area",
      safetyGearVerified: true,
      bodyTemp: 36.5,
      emergencyContact: "+91 98765 43210",
      checkIn: new Date(Date.now() - 3 * 3600 * 1000),
      notes: "Operating CAT 777D dumper",
    },
    {
      workerName: "Deepak Hansda",
      workerId: "CW-4085",
      role: "Electrician",
      shift: "Shift A (Morning)",
      zone: "Substation 2 - Surface",
      status: "present",
      liveStatus: "surface_area",
      safetyGearVerified: true,
      bodyTemp: 36.7,
      emergencyContact: "+91 97890 12345",
      checkIn: new Date(Date.now() - 4.5 * 3600 * 1000),
      notes: "Transformer breaker inspection",
    },
    {
      workerName: "Pradeep Majhi",
      workerId: "CW-4086",
      role: "Miner",
      shift: "Shift A (Morning)",
      zone: "Pit-1 Underground Face",
      status: "late",
      liveStatus: "inside_mine",
      safetyGearVerified: true,
      bodyTemp: 36.9,
      emergencyContact: "+91 96543 21098",
      checkIn: new Date(Date.now() - 2 * 3600 * 1000),
      notes: "Arrived 45m late due to transport delay",
    },
    {
      workerName: "Harish Mahato",
      workerId: "CW-4087",
      role: "Surveyor",
      shift: "Shift A (Morning)",
      zone: "Haul Road Junction",
      status: "present",
      liveStatus: "checked_out",
      safetyGearVerified: true,
      bodyTemp: 36.5,
      emergencyContact: "+91 95432 10987",
      checkIn: new Date(Date.now() - 6 * 3600 * 1000),
      checkOut: new Date(Date.now() - 30 * 60 * 1000),
      notes: "Completed seam mapping survey",
    },
    {
      workerName: "Manish Tirkey",
      workerId: "CW-4088",
      role: "Contractor Worker",
      shift: "Shift B (Evening)",
      zone: "Underground Seam-1",
      status: "present",
      liveStatus: "inside_mine",
      safetyGearVerified: true,
      bodyTemp: 36.6,
      emergencyContact: "+91 93210 98765",
      checkIn: new Date(Date.now() - 1 * 3600 * 1000),
      notes: "Roof bolting crew member",
    },
    {
      workerName: "Santosh Munda",
      workerId: "CW-4089",
      role: "Ventilation Engineer",
      shift: "Shift A (Morning)",
      zone: "Ventilation Shaft 3",
      status: "present",
      liveStatus: "inside_mine",
      safetyGearVerified: true,
      bodyTemp: 36.5,
      emergencyContact: "+91 98123 45678",
      checkIn: new Date(Date.now() - 4 * 3600 * 1000),
      notes: "Monitoring main fan velocity",
    },
  ];

  await Attendance.insertMany(
    demoWorkers.map((w) => ({
      ...w,
      mineId: targetMineId,
    }))
  );
};

// @desc    Get real-time attendance stats & counts
// @route   GET /api/attendance/realtime
// @access  Private
const getRealtimeAttendance = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user.role === "mine_official" && req.user.mineId) {
    query.mineId = req.user.mineId;
  } else if (req.query.mineId) {
    query.mineId = req.query.mineId;
  }

  // Ensure initial data if empty
  await ensureDemoAttendanceIfEmpty(query.mineId);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayQuery = {
    ...query,
    createdAt: { $gte: startOfDay },
  };

  const [
    insideMineCount,
    surfaceAreaCount,
    checkedOutCount,
    presentTodayCount,
    lateTodayCount,
    ppeVerifiedCount,
    totalTodayCount,
    activeWorkers,
  ] = await Promise.all([
    Attendance.countDocuments({ ...todayQuery, liveStatus: "inside_mine" }),
    Attendance.countDocuments({ ...todayQuery, liveStatus: "surface_area" }),
    Attendance.countDocuments({ ...todayQuery, liveStatus: "checked_out" }),
    Attendance.countDocuments({ ...todayQuery, status: "present" }),
    Attendance.countDocuments({ ...todayQuery, status: "late" }),
    Attendance.countDocuments({
      ...todayQuery,
      safetyGearVerified: true,
      liveStatus: { $in: ["inside_mine", "surface_area"] },
    }),
    Attendance.countDocuments(todayQuery),
    Attendance.find(todayQuery)
      .populate("mineId", "name code subsidiary")
      .sort({ updatedAt: -1 })
      .limit(30),
  ]);

  const ppeComplianceRate =
    insideMineCount + surfaceAreaCount > 0
      ? Math.round(
          (ppeVerifiedCount / (insideMineCount + surfaceAreaCount)) * 100
        )
      : 100;

  // Breakdown by zone
  const zoneStats = {};
  activeWorkers.forEach((w) => {
    if (w.liveStatus === "inside_mine") {
      zoneStats[w.zone] = (zoneStats[w.zone] || 0) + 1;
    }
  });

  res.json({
    success: true,
    data: {
      timestamp: new Date(),
      insideMineCount,
      surfaceAreaCount,
      checkedOutCount,
      presentTodayCount,
      lateTodayCount,
      totalTodayCount,
      ppeComplianceRate,
      zoneBreakdown: zoneStats,
      activeWorkers,
    },
  });
});

// @desc    Get all attendance records with pagination & filters
// @route   GET /api/attendance
// @access  Private
const getAttendance = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  let query = {};
  if (req.user.role === "mine_official" && req.user.mineId) {
    query.mineId = req.user.mineId;
  } else if (req.query.mineId) {
    query.mineId = req.query.mineId;
  }

  if (req.query.shift) query.shift = req.query.shift;
  if (req.query.status) query.status = req.query.status;
  if (req.query.liveStatus) query.liveStatus = req.query.liveStatus;
  if (req.query.search) {
    query.$or = [
      { workerName: { $regex: req.query.search, $options: "i" } },
      { workerId: { $regex: req.query.search, $options: "i" } },
      { zone: { $regex: req.query.search, $options: "i" } },
    ];
  }

  if (req.query.date) {
    const selectedDate = new Date(req.query.date);
    const start = new Date(selectedDate.setHours(0, 0, 0, 0));
    const end = new Date(selectedDate.setHours(23, 59, 59, 999));
    query.createdAt = { $gte: start, $lte: end };
  }

  // Ensure demo data
  await ensureDemoAttendanceIfEmpty(query.mineId);

  const total = await Attendance.countDocuments(query);
  const records = await Attendance.find(query)
    .populate("mineId", "name code subsidiary")
    .populate("markedBy", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    count: records.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: records,
  });
});

// @desc    Mark Check-In (Clock In)
// @route   POST /api/attendance/check-in
// @access  Private
const markCheckIn = asyncHandler(async (req, res) => {
  const {
    workerName,
    workerId,
    mineId,
    role,
    shift,
    zone,
    safetyGearVerified,
    bodyTemp,
    emergencyContact,
    notes,
  } = req.body;

  if (!workerName || !workerId || !mineId) {
    res.status(400);
    throw new Error("Worker name, ID, and mine selection are required");
  }

  // Check if already checked in today and currently inside
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const existing = await Attendance.findOne({
    workerId,
    createdAt: { $gte: startOfDay },
    liveStatus: { $in: ["inside_mine", "surface_area"] },
  });

  if (existing) {
    res.status(400);
    throw new Error(`${workerName} (${workerId}) is already checked in today`);
  }

  // Determine late status: standard shift starts (e.g. Shift A morning 8:00 AM)
  const now = new Date();
  let status = "present";
  if (shift === "Shift A (Morning)" && now.getHours() >= 9) {
    status = "late";
  } else if (shift === "Shift B (Evening)" && now.getHours() >= 17) {
    status = "late";
  }

  const record = await Attendance.create({
    workerName,
    workerId,
    mineId,
    role: role || "Miner",
    shift: shift || "Shift A (Morning)",
    zone: zone || "Underground Seam-1",
    status,
    liveStatus: "inside_mine",
    safetyGearVerified: safetyGearVerified !== false,
    bodyTemp: bodyTemp ? Number(bodyTemp) : 36.6,
    emergencyContact,
    notes,
    markedBy: req.user._id,
    checkIn: new Date(),
  });

  const populated = await Attendance.findById(record._id).populate(
    "mineId",
    "name code subsidiary"
  );

  // Emit real-time event if socket is available
  const io = req.app.get("io");
  if (io) {
    io.emit("attendance-updated", {
      type: "CHECK_IN",
      record: populated,
    });
  }

  res.status(201).json({
    success: true,
    message: `${workerName} successfully clocked in and marked Inside Mine`,
    data: populated,
  });
});

// @desc    Mark Check-Out / Exit Mine
// @route   POST /api/attendance/:id/check-out
// @access  Private
const markCheckOut = asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error("Attendance record not found");
  }

  record.liveStatus = "checked_out";
  record.checkOut = new Date();
  await record.save();

  const populated = await Attendance.findById(record._id).populate(
    "mineId",
    "name code subsidiary"
  );

  const io = req.app.get("io");
  if (io) {
    io.emit("attendance-updated", {
      type: "CHECK_OUT",
      record: populated,
    });
  }

  res.json({
    success: true,
    message: `${record.workerName} checked out successfully`,
    data: populated,
  });
});

// @desc    Update worker live status (inside_mine <-> surface_area)
// @route   PATCH /api/attendance/:id/live-status
// @access  Private
const updateLiveStatus = asyncHandler(async (req, res) => {
  const { liveStatus, zone } = req.body;
  const record = await Attendance.findById(req.params.id);

  if (!record) {
    res.status(404);
    throw new Error("Attendance record not found");
  }

  if (liveStatus) record.liveStatus = liveStatus;
  if (zone) record.zone = zone;
  if (liveStatus === "checked_out" && !record.checkOut) {
    record.checkOut = new Date();
  }

  await record.save();
  const populated = await Attendance.findById(record._id).populate(
    "mineId",
    "name code subsidiary"
  );

  const io = req.app.get("io");
  if (io) {
    io.emit("attendance-updated", {
      type: "STATUS_CHANGE",
      record: populated,
    });
  }

  res.json({
    success: true,
    message: "Live status updated",
    data: populated,
  });
});

module.exports = {
  getAttendance,
  getRealtimeAttendance,
  markCheckIn,
  markCheckOut,
  updateLiveStatus,
};
