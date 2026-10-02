const asyncHandler = require("express-async-handler");
const Attendance = require("../models/Attendance");
const Mine = require("../models/Mine");
const User = require("../models/User");
const WorkerTask = require("../models/WorkerTask");

const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const distanceInMeters = (firstLatitude, firstLongitude, secondLatitude, secondLongitude) => {
  const earthRadius = 6371000;
  const latitudeDelta = ((secondLatitude - firstLatitude) * Math.PI) / 180;
  const longitudeDelta = ((secondLongitude - firstLongitude) * Math.PI) / 180;
  const latitude = (firstLatitude * Math.PI) / 180;
  const targetLatitude = (secondLatitude * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitude) * Math.cos(targetLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

const isWorkerAvailable = async (worker) => {
  if (!worker || worker.isActive === false) return false;
  const attendance = await Attendance.findOne({
    workerId: worker._id,
    date: { $gte: startOfDay() },
  }).sort({ date: -1 });
  return !attendance || !["absent", "leave"].includes(attendance.status);
};

const getWorkerQuery = (req) => {
  if (req.user.role === "worker") return { _id: req.user._id };
  if (req.user.role === "mine_official" && req.user.mineId) {
    return { role: "worker", mineId: req.user.mineId };
  }
  return { role: "worker" };
};

const getWorkerSummary = asyncHandler(async (req, res) => {
  const workers = await User.find(getWorkerQuery(req))
    .select("name email phone employeeId department mineId isActive lastLogin")
    .populate("mineId", "name code");
  const workerIds = workers.map((worker) => worker._id);
  const [tasks, attendance] = await Promise.all([
    WorkerTask.find({ workerId: { $in: workerIds } })
      .populate("mineId", "name code")
      .sort({ createdAt: -1 }),
    Attendance.find({
      workerId: { $in: workerIds },
      date: { $gte: startOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) },
    }).sort({ date: -1 }),
  ]);
  const attendanceByMine = await Attendance.aggregate([
    { $match: { workerId: { $in: workerIds }, mineId: { $ne: null } } },
    {
      $group: {
        _id: { workerId: "$workerId", mineId: "$mineId" },
        firstAttendance: { $min: "$date" },
        attendanceDays: {
          $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] },
        },
        workedMilliseconds: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $in: ["$status", ["present", "late"]] },
                  { $ne: ["$checkIn", null] },
                  { $ne: ["$checkOut", null] },
                ],
              },
              { $max: [0, { $subtract: ["$checkOut", "$checkIn"] }] },
              0,
            ],
          },
        },
      },
    },
  ]);
  const attendanceMineIds = [...new Set(attendanceByMine.map((entry) => String(entry._id.mineId)))];
  const attendanceMines = await Mine.find({ _id: { $in: attendanceMineIds } }).select("name code");
  const attendanceMineMap = new Map(attendanceMines.map((mine) => [String(mine._id), mine]));

  const workerData = workers.map((worker) => {
    const workerTasks = tasks.filter(
      (task) => String(task.workerId) === String(worker._id),
    );
    const workerAttendance = attendance.filter(
      (record) => String(record.workerId) === String(worker._id),
    );
    const mineWorkMap = new Map();
    workerTasks.forEach((task) => {
      if (!task.mineId) return;
      const mineId = String(task.mineId._id);
      const mineWork = mineWorkMap.get(mineId) || {
        mine: task.mineId,
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        attendanceDays: 0,
        workedHours: 0,
        trackedSince: null,
      };
      mineWork.totalTasks += 1;
      if (task.status === "pending") mineWork.pendingTasks += 1;
      if (task.status === "in_progress") mineWork.inProgressTasks += 1;
      if (task.status === "completed") mineWork.completedTasks += 1;
      if (!mineWork.trackedSince || task.createdAt < mineWork.trackedSince) {
        mineWork.trackedSince = task.createdAt;
      }
      mineWorkMap.set(mineId, mineWork);
    });

    attendanceByMine
      .filter((entry) => String(entry._id.workerId) === String(worker._id))
      .forEach((entry) => {
        const mineId = String(entry._id.mineId);
        const mine = attendanceMineMap.get(mineId);
        if (!mine) return;
        const mineWork = mineWorkMap.get(mineId) || {
          mine,
          totalTasks: 0,
          pendingTasks: 0,
          inProgressTasks: 0,
          completedTasks: 0,
          attendanceDays: 0,
          workedHours: 0,
          trackedSince: null,
        };
        mineWork.attendanceDays = entry.attendanceDays;
        mineWork.workedHours = Math.round((entry.workedMilliseconds / 3600000) * 10) / 10;
        if (!mineWork.trackedSince || entry.firstAttendance < mineWork.trackedSince) {
          mineWork.trackedSince = entry.firstAttendance;
        }
        mineWorkMap.set(mineId, mineWork);
      });

    const mineMap = new Map();
    workerTasks.forEach((task) => {
      if (task.mineId) mineMap.set(String(task.mineId._id), task.mineId);
    });
    if (worker.mineId) mineMap.set(String(worker.mineId._id), worker.mineId);

    return {
      ...worker.toObject(),
      totalTasks: workerTasks.length,
      pendingTasks: workerTasks.filter((task) => task.status === "pending").length,
      inProgressTasks: workerTasks.filter((task) => task.status === "in_progress").length,
      completedTasks: workerTasks.filter((task) => task.status === "completed").length,
      attendance: {
        present: workerAttendance.filter((record) => record.status === "present").length,
        absent: workerAttendance.filter((record) => record.status === "absent").length,
        late: workerAttendance.filter((record) => record.status === "late").length,
        leave: workerAttendance.filter((record) => record.status === "leave").length,
        latest: workerAttendance[0] || null,
      },
      mineSites: [...mineMap.values()],
      mineWork: [...mineWorkMap.values()].sort((left, right) =>
        left.mine.name.localeCompare(right.mine.name),
      ),
      tasks: workerTasks,
    };
  });

  res.json({
    success: true,
    data: {
      workers: workerData,
      totals: {
        workers: workerData.length,
        pendingTasks: workerData.reduce((sum, worker) => sum + worker.pendingTasks, 0),
        completedTasks: workerData.reduce((sum, worker) => sum + worker.completedTasks, 0),
        presentToday: workerData.filter(
          (worker) =>
            worker.attendance.latest &&
            startOfDay(worker.attendance.latest.date).getTime() === startOfDay().getTime() &&
            ["present", "late"].includes(worker.attendance.latest.status),
        ).length,
      },
    },
  });
});

const markAttendance = asyncHandler(async (req, res) => {
  const { workerId, mineId, date, status, checkIn, checkOut, notes, latitude, longitude } = req.body;
  const targetWorkerId = req.user.role === "worker" ? req.user._id : workerId;
  if (!targetWorkerId || !status) {
    res.status(400);
    throw new Error("workerId and status are required");
  }
  const worker = await User.findOne({ _id: targetWorkerId, role: "worker" });
  if (!worker) {
    res.status(404);
    throw new Error("Worker not found");
  }

  let attendanceData = {
    workerId: targetWorkerId,
    mineId: mineId || worker.mineId || null,
    date: startOfDay(date || new Date()),
    status,
    checkIn,
    checkOut,
    notes,
    markedBy: req.user._id,
  };

  if (req.user.role === "worker") {
    if (!worker.mineId) {
      res.status(400);
      throw new Error("Your account is not assigned to a mine");
    }
    if (!["present", "late"].includes(status)) {
      res.status(400);
      throw new Error("Workers can only mark present or late");
    }
    if (startOfDay(date || new Date()).getTime() !== startOfDay().getTime()) {
      res.status(400);
      throw new Error("Workers can only mark attendance for today");
    }

    const mine = await Mine.findById(worker.mineId).select("status location");
    if (!mine || mine.status !== "active" || !mine.location?.coordinates?.length) {
      res.status(400);
      throw new Error("Your assigned mine is not available for attendance");
    }
    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
      res.status(400);
      throw new Error("Location permission is required to mark attendance");
    }

    const [mineLongitude, mineLatitude] = mine.location.coordinates;
    const distance = distanceInMeters(
      Number(latitude),
      Number(longitude),
      mineLatitude,
      mineLongitude,
    );
    const allowedDistance = Number(process.env.ATTENDANCE_GEOFENCE_METERS) || 500;
    if (distance > allowedDistance) {
      res.status(403);
      throw new Error("You must be at your assigned mine to mark attendance");
    }

    attendanceData = {
      ...attendanceData,
      mineId: worker.mineId,
      date: startOfDay(),
      checkIn: checkIn || new Date(),
      checkOut: undefined,
      notes: notes || "Self-marked at mine geofence",
    };
  }

  const record = await Attendance.findOneAndUpdate(
    { workerId: targetWorkerId, date: attendanceData.date },
    attendanceData,
    { new: true, upsert: true, runValidators: true },
  );

  res.status(201).json({ success: true, data: record });
});

const createWorkerTask = asyncHandler(async (req, res) => {
  const { workerId, mineId, title, description, department, dueDate } = req.body;
  if (!workerId || !mineId || !title) {
    res.status(400);
    throw new Error("workerId, mineId and title are required");
  }
  const worker = await User.findOne({ _id: workerId, role: "worker" });
  const mine = await Mine.findById(mineId);
  if (!worker || !mine) {
    res.status(404);
    throw new Error("Worker or mine not found");
  }

  const task = await WorkerTask.create({
    workerId,
    mineId,
    title,
    description,
    department: department || worker.department,
    dueDate,
  });
  res.status(201).json({ success: true, data: task });
});

const updateWorkerTask = asyncHandler(async (req, res) => {
  const task = await WorkerTask.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Worker task not found");
  }
  if (req.user.role === "worker" && String(task.workerId) !== String(req.user._id)) {
    res.status(403);
    throw new Error("You can only update your own tasks");
  }

  const { status } = req.body;
  if (status) {
    task.status = status;
    task.completedAt = status === "completed" ? new Date() : null;
  }
  await task.save();
  res.json({ success: true, data: task });
});

const reassignPendingTasks = asyncHandler(async (req, res) => {
  const sourceWorker = await User.findOne({ _id: req.params.workerId, role: "worker" });
  if (!sourceWorker) {
    res.status(404);
    throw new Error("Worker not found");
  }
  if (await isWorkerAvailable(sourceWorker)) {
    res.status(400);
    throw new Error("Worker is available; reassignment is not required");
  }

  const candidates = await User.find({
    role: "worker",
    _id: { $ne: sourceWorker._id },
    mineId: sourceWorker.mineId,
    isActive: { $ne: false },
  }).sort({ lastLogin: -1 });
  let replacement = null;
  for (const candidate of candidates) {
    if (await isWorkerAvailable(candidate)) {
      replacement = candidate;
      break;
    }
  }
  if (!replacement) {
    res.status(409);
    throw new Error("No available worker found for reassignment");
  }

  const result = await WorkerTask.updateMany(
    { workerId: sourceWorker._id, status: "pending" },
    { $set: { workerId: replacement._id } },
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} pending task(s) reassigned to ${replacement.name}`,
    data: { reassigned: result.modifiedCount, replacement },
  });
});

module.exports = {
  getWorkerSummary,
  markAttendance,
  createWorkerTask,
  updateWorkerTask,
  reassignPendingTasks,
};
