const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getStats,
  getOnlineUsers,
  kickUser,
  unkickUser,
  getKickedUsers,
  clearMessages,
  getAnalytics
} = require('../controllers/adminController');

// All routes require admin auth
router.use(protect);

router.get('/stats', getStats);
router.get('/analytics', getAnalytics);
router.get('/online-users', getOnlineUsers);
router.get('/kicked-users', getKickedUsers);
router.post('/kick/:socketId', kickUser);
router.post('/unkick/:username', unkickUser);
router.delete('/messages', clearMessages);

module.exports = router;
