const express = require('express');
const router = express.Router();
const {
  getContractors,
  createContractor,
  updateContractor,
} = require('../controllers/contractorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getContractors)
  .post(authorize('admin', 'corporate', 'mine_official'), createContractor);

router.route('/:id').put(authorize('admin', 'corporate'), updateContractor);

module.exports = router;