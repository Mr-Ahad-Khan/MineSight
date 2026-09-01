const express = require('express');
const router = express.Router();
const {
  getInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  closeViolation,
} = require('../controllers/inspectionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getInspections).post(createInspection);

router.route('/:id').get(getInspectionById).put(updateInspection);

router.patch('/:id/violations/:violationId', closeViolation);

module.exports = router;