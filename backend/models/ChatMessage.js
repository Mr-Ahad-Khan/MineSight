const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    reply: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
