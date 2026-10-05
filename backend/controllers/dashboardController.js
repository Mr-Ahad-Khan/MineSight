const asyncHandler = require('express-async-handler');
const Mine = require('../models/Mine');
const Inspection = require('../models/Inspection');
const Compliance = require('../models/Compliance');
const Alert = require('../models/Alert');
const Contractor = require('../models/Contractor');
const { serializeInspectionMedia } = require('../utils/mediaStorage');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = asyncHandler(async (req, res) => {
  let mineFilter = {};
  const mineQuery = {};

  if (!['admin', 'corporate'].includes(req.user.role)) {
    mineQuery.$or = [{ visibility: 'public' }, { visibility: { $exists: false } }];
  }

  if (['mine_official', 'worker'].includes(req.user.role) && req.user.mineId) {
    mineFilter = { mineId: req.user.mineId };
    mineQuery._id = req.user.mineId;
  }

  const totalMines = await Mine.countDocuments(mineQuery);

  const totalInspections = await Inspection.countDocuments(mineFilter);

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

  // Clean up any orphaned alerts whose referenced inspection was deleted
  const inspectionAlerts = await Alert.find({
    relatedInspection: { $exists: true, $ne: null },
  }).select('_id relatedInspection');
  if (inspectionAlerts.length > 0) {
    const existingInspections = new Set(
      (
        await Inspection.find({
          _id: { $in: inspectionAlerts.map((a) => a.relatedInspection) },
        }).select('_id')
      ).map((i) => String(i._id))
    );
    const orphanedIds = inspectionAlerts
      .filter((a) => !existingInspections.has(String(a.relatedInspection)))
      .map((a) => a._id);
    if (orphanedIds.length > 0) {
      await Alert.deleteMany({ _id: { $in: orphanedIds } });
    }
  }

  const unreadAlerts = await Alert.countDocuments({
    ...(req.user.role === 'mine_official' ? { assignedTo: req.user._id } : {}),
    isRead: false,
  });

  const activeContractors = await Contractor.countDocuments({ status: 'active' });

  // Average compliance score
  const mines = await Mine.find(mineQuery).select('complianceScore riskLevel');

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
      totalInspections,
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
  if (['mine_official', 'worker'].includes(req.user.role) && req.user.mineId) {
    mineFilter.mineId = req.user.mineId;
  }

  const reportFilter = { ...mineFilter };
  if (req.query.severity) reportFilter.severity = req.query.severity;
  if (req.query.status) reportFilter.status = req.query.status;

  // Recent high risk inspections
  const highRiskInspections = await Inspection.find({
    ...reportFilter,
    riskScore: { $gte: 60 },
  })
    .populate('mineId', 'name code')
    .sort({ riskScore: -1 })
    .limit(10);

  // Recurring violations (simple grouping by category)
  const recentInspections = await Inspection.find({
    ...reportFilter,
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
        ...reportFilter,
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

  const periodDays = { weekly: 7, monthly: 30, yearly: 365 };
  const hasCustomRange = req.query.period === 'custom' && req.query.startDate && req.query.endDate;
  const period = hasCustomRange ? 'custom' : periodDays[req.query.period] ? req.query.period : 'monthly';
  const currentPeriodEnd = hasCustomRange ? new Date(`${req.query.endDate}T23:59:59.999Z`) : new Date();
  const currentPeriodStart = hasCustomRange ? new Date(`${req.query.startDate}T00:00:00.000Z`) : new Date(Date.now() - periodDays[period] * 24 * 60 * 60 * 1000);
  const rangeLength = currentPeriodEnd.getTime() - currentPeriodStart.getTime();
  const previousPeriodStart = new Date(currentPeriodStart.getTime() - rangeLength);
  const periodStats = await Promise.all(
    [
      { start: currentPeriodStart, end: new Date() },
      { start: previousPeriodStart, end: currentPeriodStart },
    ].map(async ({ start, end }) => {
      const periodFilter = {
        ...reportFilter,
        createdAt: { $gte: start, $lt: end },
      };
      const [inspectionCount, highRiskCount, riskSummary, inspections] = await Promise.all([
        Inspection.countDocuments(periodFilter),
        Inspection.countDocuments({ ...periodFilter, riskScore: { $gte: 60 } }),
        Inspection.aggregate([
          { $match: periodFilter },
          { $group: { _id: null, avgRisk: { $avg: '$riskScore' } } },
        ]),
        Inspection.find(periodFilter).select('violations'),
      ]);

      return {
        inspectionCount,
        highRiskCount,
        avgRisk: Math.round(riskSummary[0]?.avgRisk || 0),
        violationCount: inspections.reduce(
          (total, inspection) => total + inspection.violations.length,
          0,
        ),
      };
    }),
  );

  res.json({
    success: true,
    data: {
      highRiskInspections: highRiskInspections.map(serializeInspectionMedia),
      recurringViolations,
      monthlyTrend,
      periodComparison: {
        period,
        current: periodStats[0],
        previous: periodStats[1],
      },
    },
  });
});

module.exports = {
  getDashboardSummary,
  getAnalytics,
};
