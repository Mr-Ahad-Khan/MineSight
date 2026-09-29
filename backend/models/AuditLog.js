const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    ip: {
      type: String,
    },
    sequence: {
      type: Number,
      unique: true,
      sparse: true,
    },
    previousHash: {
      type: String,
    },
    blockHash: {
      type: String,
    },
    blockTimestamp: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, sequence: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);