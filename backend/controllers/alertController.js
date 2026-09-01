const asyncHandler = require('express-async-handler');
const Alert = require('../models/Alert');

// @desc    Get alerts
// @route   GET /api/alerts
// @access  Private
const getAlerts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = {};

  if (req.user.role === 'mine_official') {
    query.assignedTo = req.user._id;
  }

  if (req.query.isRead !== undefined) {
    query.isRead = req.query.isRead === 'true';
  }
  if (req.query.severity) {
    query.severity = req.query.severity;
  }

  const total = await Alert.countDocuments(query);
  const alerts = await Alert.find(query)
    .populate('mineId', 'name code')
    .populate('relatedInspection', 'title riskScore')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: alerts.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: alerts,
  });
});

// @desc    Mark alert as read
// @route   PATCH /api/alerts/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id);

  if (!alert) {
    res.status(404);
    throw new Error('Alert not found');
  }

  alert.isRead = true;
  await alert.save();

  res.json({
    success: true,
    data: alert,
  });
});

// @desc    Mark all alerts as read
// @route   PATCH /api/alerts/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'mine_official' ? { assignedTo: req.user._id } : {};

  await Alert.updateMany({ ...filter, isRead: false }, { isRead: true });

  res.json({
    success: true,
    message: 'All alerts marked as read',
  });
});

module.exports = {
  getAlerts,
  markAsRead,
  markAllAsRead,
};