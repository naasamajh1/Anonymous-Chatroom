const Message = require('../models/Message');

// @desc    Get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const io = req.app.get('io');
    const activeUsers = io.activeUsers || new Map();

    const totalMessages = await Message.countDocuments();
    const flaggedMessages = await Message.countDocuments({ isFiltered: true });
    const onlineUsers = activeUsers.size;

    // Messages in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentMessages = await Message.countDocuments({ createdAt: { $gte: oneHourAgo } });

    res.status(200).json({
      success: true,
      stats: {
        onlineUsers,
        totalMessages,
        flaggedMessages,
        recentMessages
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get online users list
exports.getOnlineUsers = async (req, res) => {
  try {
    const io = req.app.get('io');
    const activeUsers = io.activeUsers || new Map();

    const users = Array.from(activeUsers.entries()).map(([socketId, user]) => ({
      socketId,
      username: user.username,
      joinedAt: user.joinedAt
    }));

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Kick a user from chat
exports.kickUser = async (req, res) => {
  try {
    const { socketId } = req.params;
    const io = req.app.get('io');
    const activeUsers = io.activeUsers || new Map();
    const kickedUsers = io.kickedUsers || new Set();

    const user = activeUsers.get(socketId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Add to kicked list
    kickedUsers.add(user.username.toLowerCase());

    // Emit kick event and disconnect
    io.to(socketId).emit('kicked', { reason: req.body.reason || 'You have been kicked by an admin.' });
    const targetSocket = io.sockets.sockets.get(socketId);
    if (targetSocket) targetSocket.disconnect(true);

    res.status(200).json({ success: true, message: `${user.username} has been kicked` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Unkick a username
exports.unkickUser = async (req, res) => {
  try {
    const { username } = req.params;
    const io = req.app.get('io');
    const kickedUsers = io.kickedUsers || new Set();

    kickedUsers.delete(username.toLowerCase());

    res.status(200).json({ success: true, message: `${username} has been unkicked` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get kicked users list
exports.getKickedUsers = async (req, res) => {
  try {
    const io = req.app.get('io');
    const kickedUsers = io.kickedUsers || new Set();

    res.status(200).json({ success: true, kicked: Array.from(kickedUsers) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Clear all messages
exports.clearMessages = async (req, res) => {
  try {
    await Message.deleteMany({});
    const io = req.app.get('io');
    io.to('global-chat').emit('messages_cleared');

    res.status(200).json({ success: true, message: 'All messages cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const io = req.app.get('io');
    const activeUsers = io.activeUsers || new Map();

    // Message activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const msgStats = await Message.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          flagged: { $sum: { $cond: ['$isFiltered', 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const messageData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const found = msgStats.find(m => m._id === dateStr);
      messageData.push({
        date: dateStr,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        total: found ? found.total : 0,
        flagged: found ? found.flagged : 0
      });
    }

    // Hourly activity
    const hourlyActivity = await Message.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const activityData = [];
    for (let h = 0; h < 24; h++) {
      const found = hourlyActivity.find(a => a._id === h);
      activityData.push({
        hour: h,
        label: `${h.toString().padStart(2, '0')}:00`,
        count: found ? found.count : 0
      });
    }

    // Top chatters (by message count)
    const topChatters = await Message.aggregate([
      { $match: { isFiltered: false } },
      { $group: { _id: '$sender', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Moderation stats
    const totalMessages = await Message.countDocuments();
    const flaggedMessages = await Message.countDocuments({ isFiltered: true });

    res.status(200).json({
      success: true,
      analytics: {
        messageActivity: messageData,
        hourlyActivity: activityData,
        topChatters: topChatters.map(t => ({ username: t._id, count: t.count })),
        moderationStats: {
          total: totalMessages,
          clean: totalMessages - flaggedMessages,
          flagged: flaggedMessages,
          rate: totalMessages > 0 ? ((flaggedMessages / totalMessages) * 100).toFixed(1) : 0
        },
        onlineNow: activeUsers.size
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
