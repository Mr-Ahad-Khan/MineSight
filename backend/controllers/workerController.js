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

  const workerData = workers.map((worker) => {
    const workerTasks = tasks.filter(
      (task) => String(task.workerId) === String(worker._id),
    );
    const workerAttendance = attendance.filter(
      (record) => String(record.workerId) === String(worker._id),
    );
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
  const { workerId, mineId, date, status, checkIn, checkOut, notes } = req.body;
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

  const record = await Attendance.findOneAndUpdate(
    { workerId: targetWorkerId, date: startOfDay(date || new Date()) },
    {
      workerId: targetWorkerId,
      mineId: mineId || worker.mineId || null,
      date: startOfDay(date || new Date()),
      status,
      checkIn,
      checkOut,
      notes,
    },
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
