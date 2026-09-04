const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['safety', 'environment', 'production', 'labour', 'other'],
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  correctiveAction: {
    type: String,
  },
  dueDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  closedAt: {
    type: Date,
  },
});

const inspectionSchema = new mongoose.Schema(
  {
    mineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mine',
      required: true,
    },
    inspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['safety', 'environment', 'surprise', 'scheduled', 'incident'],
      default: 'scheduled',
    },
    title: {
      type: String,
      required: [true, 'Please add inspection title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    photos: [
      {
        type: String,
      },
    ],
    audio: {
      type: String,
    },
    observations: {
      type: String,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'closed', 'escalated'],
      default: 'open',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    violations: [violationSchema],
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    closedAt: {
      type: Date,
    },
    offlineId: {
      type: String, // for offline sync
    },
  },
  {
    timestamps: true,
  }
);

inspectionSchema.index({ location: '2dsphere' });
inspectionSchema.index({ mineId: 1, createdAt: -1 });

module.exports = mongoose.model('Inspection', inspectionSchema);