const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mine",
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "leave"],
      required: true,
    },
    checkIn: Date,
    checkOut: Date,
    notes: String,
  },
  { timestamps: true },
);

attendanceSchema.index({ workerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
