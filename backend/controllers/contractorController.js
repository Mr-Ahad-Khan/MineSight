const asyncHandler = require('express-async-handler');
const Contractor = require('../models/Contractor');

// @desc    Get all contractors
// @route   GET /api/contractors
// @access  Private
const getContractors = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.mineId) query.mineIds = req.query.mineId;

  const total = await Contractor.countDocuments(query);
  const contractors = await Contractor.find(query)
    .populate('mineIds', 'name code')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: contractors.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: contractors,
  });
});

// @desc    Create contractor
// @route   POST /api/contractors
// @access  Private
const createContractor = asyncHandler(async (req, res) => {
  const contractor = await Contractor.create(req.body);

  res.status(201).json({
    success: true,
    data: contractor,
  });
});

// @desc    Update contractor
// @route   PUT /api/contractors/:id
// @access  Private
const updateContractor = asyncHandler(async (req, res) => {
  let contractor = await Contractor.findById(req.params.id);

  if (!contractor) {
    res.status(404);
    throw new Error('Contractor not found');
  }

  contractor = await Contractor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: contractor,
  });
});

module.exports = {
  getContractors,
  createContractor,
  updateContractor,
};