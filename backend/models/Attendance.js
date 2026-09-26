const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    workerName: {
      type: String,
      required: [true, "Please provide worker name"],
      trim: true,
    },
    workerId: {
      type: String,
      required: [true, "Please provide worker / badge ID"],
      trim: true,
      index: true,
    },
    mineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mine",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: [
        "Miner",
        "Blaster",
        "Safety Officer",
        "Heavy Equipment Operator",
        "Surveyor",
        "Electrician",
        "Contractor Worker",
        "Supervisor",
        "Ventilation Engineer",
      ],
      default: "Miner",
    },
    shift: {
      type: String,
      enum: ["Shift A (Morning)", "Shift B (Evening)", "Shift C (Night)"],
      default: "Shift A (Morning)",
    },
    zone: {
      type: String,
      default: "Underground Seam-1",
      trim: true,
    },
    checkIn: {
      type: Date,
      default: Date.now,
    },
    checkOut: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["present", "late", "absent", "on_leave"],
      default: "present",
    },
    liveStatus: {
      type: String,
      enum: ["inside_mine", "surface_area", "checked_out"],
      default: "inside_mine",
      index: true,
    },
    safetyGearVerified: {
      type: Boolean,
      default: true,
    },
    bodyTemp: {
      type: Number,
      default: 36.6,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
