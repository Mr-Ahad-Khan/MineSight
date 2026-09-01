const express = require('express');
const router = express.Router();
const {
  getMines,
  getMineById,
  createMine,
  updateMine,
} = require('../controllers/mineController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getMines).post(authorize('admin', 'corporate'), createMine);

router.route('/:id').get(getMineById).put(authorize('admin', 'corporate'), updateMine);

module.exports = router;