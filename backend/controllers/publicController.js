const asyncHandler = require('express-async-handler');
const Mine = require('../models/Mine');
const Inspection = require('../models/Inspection');
const Compliance = require('../models/Compliance');
const Alert = require('../models/Alert');
const ChatMessage = require('../models/ChatMessage');

const getHomeStats = asyncHandler(async (req, res) => {
  const [activeMines, openInspections, complianceReports, inspectionReports, alertReports, totalAlerts, mines] = await Promise.all([
    Mine.countDocuments({ status: 'active' }),
    Inspection.countDocuments({ status: { $in: ['open', 'in_progress', 'escalated'] } }),
    Compliance.countDocuments(),
    Inspection.countDocuments(),
    Alert.countDocuments(),
    Alert.countDocuments(),
    Mine.find({ status: 'active' }).select('complianceScore'),
  ]);

  const averageCompliance = mines.length
    ? Number((mines.reduce((total, mine) => total + mine.complianceScore, 0) / mines.length).toFixed(1))
    : 0;

  res.json({
    success: true,
    data: {
      activeMines,
      averageCompliance,
      openInspections,
      totalReports: complianceReports + inspectionReports + alertReports,
      totalAlerts,
    },
  });
});

const createChatMessage = asyncHandler(async (req, res) => {
  const { email, message, reply } = req.body;
  if (!email || !message || !reply) {
    res.status(400);
    throw new Error('Email, message, and reply are required');
  }

  const chatMessage = await ChatMessage.create({ email, message, reply });
  res.status(201).json({ success: true, data: { id: chatMessage._id } });
});

const getChatMessages = asyncHandler(async (req, res) => {
  const messages = await ChatMessage.find().sort({ createdAt: -1 }).limit(200).select('-__v');
  res.json({ success: true, data: messages });
});

module.exports = { getHomeStats, createChatMessage, getChatMessages };
