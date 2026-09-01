const asyncHandler = require('express-async-handler');
const Mine = require('../models/Mine');
const Inspection = require('../models/Inspection');
const Compliance = require('../models/Compliance');
const Alert = require('../models/Alert');
const Contractor = require('../models/Contractor');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = asyncHandler(async (req, res) => {
  let mineFilter = {};

  if (req.user.role === 'mine_official' && req.user.mineId) {
    mineFilter = { mineId: req.user.mineId };
  }

  const totalMines = await Mine.countDocuments(
    req.user.role === 'mine_official' && req.user.mineId ? { _id: req.user.mineId } : {}
  );

  const openInspections = await Inspection.countDocuments({
    ...mineFilter,
    status: { $in: ['open', 'in_progress'] },
  });

  const criticalInspections = await Inspection.countDocuments({
    ...mineFilter,
    severity: 'critical',
    status: { $ne: 'closed' },
  });

  const overdueCompliances = await Compliance.countDocuments({
    ...mineFilter,
    dueDate: { $lt: new Date() },
    status: { $in: ['pending', 'non_compliant'] },
  });

  const unreadAlerts = await Alert.countDocuments({
    ...(req.user.role === 'mine_official' ? { assignedTo: req.user._id } : {}),
    isRead: false,
  });

  const activeContractors = await Contractor.countDocuments({ status: 'active' });

  // Average compliance score
  const mines = await Mine.find(
    req.user.role === 'mine_official' && req.user.mineId ? { _id: req.user.mineId } : {}
  ).select('complianceScore riskLevel');

  const avgComplianceScore =
    mines.length > 0
      ? Math.round(mines.reduce((sum, m) => sum + m.complianceScore, 0) / mines.length)
      : 100;

  // Risk distribution
  const riskDistribution = {
    low: mines.filter((m) => m.riskLevel === 'low').length,
    medium: mines.filter((m) => m.riskLevel === 'medium').length,
    high: mines.filter((m) => m.riskLevel === 'high').length,
    critical: mines.filter((m) => m.riskLevel === 'critical').length,
  };

  res.json({
    success: true,
    data: {
      totalMines,
      openInspections,
      criticalInspections,
      overdueCompliances,
      unreadAlerts,
      activeContractors,
      avgComplianceScore,
      riskDistribution,
    },
  });
});

// @desc    Get AI Analytics data
// @route   GET /api/dashboard/analytics
// @access  Private
const getAnalytics = asyncHandler(async (req, res) => {
  let mineFilter = {};
  if (req.user.role === 'mine_official' && req.user.mineId) {
    mineFilter.mineId = req.user.mineId;
  }

  // Recent high risk inspections
  const highRiskInspections = await Inspection.find({
    ...mineFilter,
    riskScore: { $gte: 60 },
  })
    .populate('mineId', 'name code')
    .sort({ riskScore: -1 })
    .limit(10);

  // Recurring violations (simple grouping by category)
  const recentInspections = await Inspection.find({
    ...mineFilter,
    createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
  }).select('violations');

  const violationCount = {};
  recentInspections.forEach((insp) => {
    insp.violations.forEach((v) => {
      const key = v.category || 'other';
      violationCount[key] = (violationCount[key] || 0) + 1;
    });
  });

  const recurringViolations = Object.entries(violationCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  // Monthly inspection trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyTrend = await Inspection.aggregate([
    {
      $match: {
        ...mineFilter,
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
        avgRisk: { $avg: '$riskScore' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    data: {
      highRiskInspections,
      recurringViolations,
      monthlyTrend,
    },
  });
});

module.exports = {
  getDashboardSummary,
  getAnalytics,
};