const mongoose = require("mongoose");

const workerTaskSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mine",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please add a task title"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    dueDate: Date,
    completedAt: Date,
  },
  { timestamps: true },
);

workerTaskSchema.index({ workerId: 1, status: 1 });
workerTaskSchema.index({ mineId: 1, createdAt: -1 });

module.exports = mongoose.model("WorkerTask", workerTaskSchema);
