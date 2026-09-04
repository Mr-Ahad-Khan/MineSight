const express = require('express');
const router = express.Router();
const { getHomeStats, createChatMessage, getChatMessages } = require('../controllers/publicController');
const { protect } = require('../middleware/auth');

router.get('/home-stats', getHomeStats);
router.post('/chat-messages', createChatMessage);
router.get('/chat-messages', protect, getChatMessages);

module.exports = router;
