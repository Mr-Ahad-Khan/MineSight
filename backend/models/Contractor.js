const mongoose = require('mongoose');

const contractorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add contractor name'],
      trim: true,
    },
    registrationNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    mineIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mine',
      },
    ],
    contractStart: {
      type: Date,
    },
    contractEnd: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'blacklisted', 'expired'],
      default: 'active',
    },
    complianceScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Contractor', contractorSchema);