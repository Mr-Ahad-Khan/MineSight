const asyncHandler = require('express-async-handler');
const Compliance = require('../models/Compliance');

// @desc    Get all compliances
// @route   GET /api/compliances
// @access  Private
const getCompliances = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = {};

  if (req.user.role === 'mine_official' && req.user.mineId) {
    query.mineId = req.user.mineId;
  } else if (req.query.mineId) {
    query.mineId = req.query.mineId;
  }

  if (req.query.category) query.category = req.query.category;
  if (req.query.status) query.status = req.query.status;

  const total = await Compliance.countDocuments(query);
  const compliances = await Compliance.find(query)
    .populate('mineId', 'name code')
    .populate('responsiblePerson', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ dueDate: 1 });

  res.json({
    success: true,
    count: compliances.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: compliances,
  });
});

// @desc    Create compliance
// @route   POST /api/compliances
// @access  Private
const createCompliance = asyncHandler(async (req, res) => {
  const compliance = await Compliance.create(req.body);

  res.status(201).json({
    success: true,
    data: compliance,
  });
});

// @desc    Update compliance
// @route   PUT /api/compliances/:id
// @access  Private
const updateCompliance = asyncHandler(async (req, res) => {
  let compliance = await Compliance.findById(req.params.id);

  if (!compliance) {
    res.status(404);
    throw new Error('Compliance not found');
  }

  compliance = await Compliance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: compliance,
  });
});

// @desc    Get overdue compliances
// @route   GET /api/compliances/overdue
// @access  Private
const getOverdueCompliances = asyncHandler(async (req, res) => {
  let query = {
    dueDate: { $lt: new Date() },
    status: { $in: ['pending', 'non_compliant'] },
  };

  if (req.user.role === 'mine_official' && req.user.mineId) {
    query.mineId = req.user.mineId;
  }

  const overdue = await Compliance.find(query)
    .populate('mineId', 'name code')
    .populate('responsiblePerson', 'name')
    .sort({ dueDate: 1 });

  res.json({
    success: true,
    count: overdue.length,
    data: overdue,
  });
});

module.exports = {
  getCompliances,
  createCompliance,
  updateCompliance,
  getOverdueCompliances,
};