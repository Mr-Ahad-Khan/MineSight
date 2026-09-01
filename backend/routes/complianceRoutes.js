const express = require('express');
const router = express.Router();
const {
  getCompliances,
  createCompliance,
  updateCompliance,
  getOverdueCompliances,
} = require('../controllers/complianceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/overdue', getOverdueCompliances);
router.route('/').get(getCompliances).post(createCompliance);
router.route('/:id').put(updateCompliance);

module.exports = router;