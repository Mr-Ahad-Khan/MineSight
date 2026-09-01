const mongoose = require('mongoose');

const complianceSchema = new mongoose.Schema(
  {
    mineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mine',
      required: true,
    },
    category: {
      type: String,
      enum: ['safety', 'environment', 'production', 'labour', 'other'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add compliance title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    statutoryReference: {
      type: String,
      trim: true,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['compliant', 'non_compliant', 'pending', 'overdue'],
      default: 'pending',
    },
    lastChecked: {
      type: Date,
    },
    responsiblePerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    documents: [
      {
        type: String, // file URLs
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Compliance', complianceSchema);