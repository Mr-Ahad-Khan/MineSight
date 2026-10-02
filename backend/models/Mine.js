const mongoose = require('mongoose');

const mineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add mine name'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please add mine code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    subsidiary: {
      type: String,
      required: true,
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
        required: true,
      },
    },
    address: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'under_maintenance', 'undiscovered'],
      default: 'active',
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    complianceScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    disasterProne: {
      type: Boolean,
      default: false,
    },
    disasterSeason: {
      type: String,
      trim: true,
      default: 'Not specified',
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index
mineSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Mine', mineSchema);