const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    mineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mine',
    },
    type: {
      type: String,
      enum: ['compliance_due', 'violation', 'high_risk', 'escalation', 'anomaly', 'info'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
    relatedInspection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection',
    },
    relatedCompliance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Compliance',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ assignedTo: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);