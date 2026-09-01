const express = require('express');
const router = express.Router();
const { getDashboardSummary, getAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/analytics', getAnalytics);

module.exports = router;