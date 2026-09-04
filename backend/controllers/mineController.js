const asyncHandler = require('express-async-handler');
const Mine = require('../models/Mine');

// @desc    Get all mines
// @route   GET /api/mines
// @access  Private
const getMines = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = {};

  if (req.query.subsidiary) {
    query.subsidiary = req.query.subsidiary;
  }
  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.riskLevel) {
    query.riskLevel = req.query.riskLevel;
  }

  const total = await Mine.countDocuments(query);
  const mines = await Mine.find(query)
    .populate('managerId', 'name email phone')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: mines.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: mines,
  });
});

// @desc    Get single mine
// @route   GET /api/mines/:id
// @access  Private
const getMineById = asyncHandler(async (req, res) => {
  const mine = await Mine.findById(req.params.id).populate('managerId', 'name email phone');

  if (!mine) {
    res.status(404);
    throw new Error('Mine not found');
  }

  res.json({
    success: true,
    data: mine,
  });
});

// @desc    Create mine
// @route   POST /api/mines
// @access  Private (Admin / Corporate)
const createMine = asyncHandler(async (req, res) => {
  const { name, code, subsidiary, coordinates, address, managerId } = req.body;

  if (!name || !code || !subsidiary || !coordinates) {
    res.status(400);
    throw new Error('Please provide name, code, subsidiary and coordinates');
  }

  const mineExists = await Mine.findOne({ code });
  if (mineExists) {
    res.status(400);
    throw new Error('Mine with this code already exists');
  }

  const mine = await Mine.create({
    name,
    code,
    subsidiary,
    location: {
      type: 'Point',
      coordinates, // [lng, lat]
    },
    address,
    managerId,
  });

  res.status(201).json({
    success: true,
    data: mine,
  });
});

// @desc    Update mine
// @route   PUT /api/mines/:id
// @access  Private (Admin / Corporate)
const updateMine = asyncHandler(async (req, res) => {
  let mine = await Mine.findById(req.params.id);

  if (!mine) {
    res.status(404);
    throw new Error('Mine not found');
  }

  mine = await Mine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: mine,
  });
});

module.exports = {
  getMines,
  getMineById,
  createMine,
  updateMine,
};