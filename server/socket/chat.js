const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = (io) => {
  // Middleware: authenticate socket with JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.user.id})`);

    // Join user to their personal room for notifications
    socket.join(`user:${socket.user.id}`);

    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv:${conversationId}`);
      console.log(`${socket.user.name} joined conversation ${conversationId}`);
    });

    // Leave a conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Send a message
    socket.on('send_message', async ({ conversationId, content }) => {
      if (!content || !conversationId) return;

      try {
        // Verify user belongs to this conversation
        const [conv] = await db.query('SELECT * FROM conversations WHERE id = ?', [conversationId]);
        if (conv.length === 0) return;
        if (conv[0].buyer_id !== socket.user.id && conv[0].seller_id !== socket.user.id) return;

        // Save message to DB
        const [result] = await db.query(
          'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
          [conversationId, socket.user.id, content]
        );

        const message = {
          id: result.insertId,
          conversation_id: conversationId,
          sender_id: socket.user.id,
          sender_name: socket.user.name,
          content,
          is_read: false,
          created_at: new Date(),
        };

        // Broadcast to everyone in the conversation room
        io.to(`conv:${conversationId}`).emit('new_message', message);

        // Notify the other user (for unread badge)
        const otherUserId = conv[0].buyer_id === socket.user.id ? conv[0].seller_id : conv[0].buyer_id;
        io.to(`user:${otherUserId}`).emit('message_notification', {
          conversationId,
          from: socket.user.name,
          preview: content.substring(0, 50),
        });
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    // Typing indicator
    socket.on('typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('user_typing', {
        userId: socket.user.id,
        name: socket.user.name,
      });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('user_stop_typing', { userId: socket.user.id });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.name}`);
    });
  });
};
