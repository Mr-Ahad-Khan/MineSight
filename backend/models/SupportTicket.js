const mongoose = require("mongoose");

const ticketResponseSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  senderRole: {
    type: String,
    default: "user",
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
    },
    userEmail: {
      type: String,
    },
    mineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mine",
    },
    subject: {
      type: String,
      required: [true, "Please provide a subject"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "emergency",
        "safety_alert",
        "hardware_iot",
        "portal_bug",
        "compliance_query",
        "account_access",
        "general",
      ],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    description: {
      type: String,
      required: [true, "Please provide ticket description"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    responses: [ticketResponseSchema],
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
