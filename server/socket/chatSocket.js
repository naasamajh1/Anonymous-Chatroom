const Message = require('../models/Message');
const { moderateMessage } = require('../utils/moderator');

// Active users map: socketId -> { username, joinedAt }
const activeUsers = new Map();
// Kicked usernames (session-based bans)
const kickedUsers = new Set();

module.exports = (io) => {
  io.on('connection', (socket) => {
    const { username } = socket.handshake.auth;

    if (!username || typeof username !== 'string' || username.trim().length < 2) {
      socket.emit('error_message', 'Invalid username');
      socket.disconnect();
      return;
    }

    const cleanName = username.trim();

    // Check if kicked
    if (kickedUsers.has(cleanName.toLowerCase())) {
      socket.emit('error_message', 'You have been kicked from the chat. Try with a different name.');
      socket.disconnect();
      return;
    }

    // Check if username is already taken
    for (const [, user] of activeUsers) {
      if (user.username.toLowerCase() === cleanName.toLowerCase()) {
        socket.emit('error_message', 'Username is already taken. Please choose another.');
        socket.disconnect();
        return;
      }
    }

    // Store user
    activeUsers.set(socket.id, { username: cleanName, joinedAt: new Date() });
    console.log(`🔗 User connected: ${cleanName}`);

    // Start with empty messages (ephemeral)
    socket.emit('recent_messages', []);

    // Join room
    socket.join('global-chat');

    // Notify others
    io.to('global-chat').emit('user_joined', {
      username: cleanName,
      onlineCount: activeUsers.size,
      onlineUsers: Array.from(activeUsers.values()).map(u => u.username)
    });

    io.to('global-chat').emit('online_count', activeUsers.size);

    // Handle messages
    socket.on('send_message', async (data) => {
      if (!data.content || typeof data.content !== 'string' || !data.content.trim()) return;

      const content = data.content.trim().slice(0, 1000);

      // AI moderation
      const modResult = await moderateMessage(content);

      if (modResult.isInappropriate) {
        // Save but mark as filtered
        await Message.create({ sender: cleanName, content, isFiltered: true, filterReason: modResult.reason });

        socket.emit('message_warning', {
          message: 'Your message was flagged for inappropriate content and was not sent.',
          reason: modResult.reason
        });
        return;
      }

      // Save message
      const message = await Message.create({ sender: cleanName, content });

      // Broadcast
      io.to('global-chat').emit('new_message', {
        _id: message._id,
        sender: cleanName,
        content: message.content,
        createdAt: message.createdAt
      });
    });

    // Typing indicator
    socket.on('typing', () => {
      socket.to('global-chat').emit('user_typing', { username: cleanName });
    });

    socket.on('stop_typing', () => {
      socket.to('global-chat').emit('user_stop_typing', { username: cleanName });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${cleanName}`);
      activeUsers.delete(socket.id);

      // Ephemeral: Delete ALL messages when any user disconnects
      await Message.deleteMany({});

      io.to('global-chat').emit('user_left', {
        username: cleanName,
        onlineCount: activeUsers.size,
        onlineUsers: Array.from(activeUsers.values()).map(u => u.username)
      });

      io.to('global-chat').emit('online_count', activeUsers.size);
    });
  });

  // Expose active users and kicked set for admin
  io.activeUsers = activeUsers;
  io.kickedUsers = kickedUsers;
};
