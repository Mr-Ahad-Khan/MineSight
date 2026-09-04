const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const {
  getInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection,
  closeViolation,
} = require('../controllers/inspectionController');
const { protect } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || (file.mimetype.startsWith('audio/') ? '.webm' : '.jpg');
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const inspectionUpload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }

    cb(new Error('Only image and audio files are allowed'));
  },
});

router.use(protect);

router.route('/').get(getInspections).post(
  inspectionUpload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'photos', maxCount: 5 },
  ]),
  createInspection
);

router.route('/:id').get(getInspectionById).put(updateInspection).delete(deleteInspection);

router.patch('/:id/violations/:violationId', closeViolation);

module.exports = router;