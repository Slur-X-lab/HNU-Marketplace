const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

// GET /api/chat/conversations - get all conversations for current user
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*,
        p.title AS product_title, p.images AS product_images,
        buyer.name AS buyer_name, buyer.avatar AS buyer_avatar,
        seller.name AS seller_name, seller.avatar AS seller_avatar,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_at,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = FALSE AND sender_id != ?) AS unread_count
      FROM conversations c
      LEFT JOIN products p ON c.product_id = p.id
      JOIN users buyer ON c.buyer_id = buyer.id
      JOIN users seller ON c.seller_id = seller.id
      WHERE c.buyer_id = ? OR c.seller_id = ?
      ORDER BY last_message_at DESC
    `, [req.user.id, req.user.id, req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/chat/conversations - start or get existing conversation
router.post('/conversations', authMiddleware, async (req, res) => {
  const { product_id, seller_id } = req.body;
  if (!seller_id) return res.status(400).json({ message: 'seller_id is required.' });
  if (seller_id === req.user.id) return res.status(400).json({ message: 'Cannot chat with yourself.' });

  try {
    const [existing] = await db.query(
      'SELECT * FROM conversations WHERE product_id = ? AND buyer_id = ? AND seller_id = ?',
      [product_id || null, req.user.id, seller_id]
    );
    if (existing.length > 0) return res.json(existing[0]);

    const [result] = await db.query(
      'INSERT INTO conversations (product_id, buyer_id, seller_id) VALUES (?, ?, ?)',
      [product_id || null, req.user.id, seller_id]
    );
    const [newConv] = await db.query('SELECT * FROM conversations WHERE id = ?', [result.insertId]);
    res.status(201).json(newConv[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/chat/conversations/:id/messages
router.get('/conversations/:id/messages', authMiddleware, async (req, res) => {
  try {
    const [conv] = await db.query('SELECT * FROM conversations WHERE id = ?', [req.params.id]);
    if (conv.length === 0) return res.status(404).json({ message: 'Conversation not found.' });
    if (conv[0].buyer_id !== req.user.id && conv[0].seller_id !== req.user.id)
      return res.status(403).json({ message: 'Not authorized.' });

    // Mark messages as read
    await db.query(
      'UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ?',
      [req.params.id, req.user.id]
    );

    const [messages] = await db.query(`
      SELECT m.*, u.name AS sender_name, u.avatar AS sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `, [req.params.id]);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/chat/conversations/:id/messages - send a message (REST fallback)
router.post('/conversations/:id/messages', authMiddleware, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Message content is required.' });

  try {
    const [conv] = await db.query('SELECT * FROM conversations WHERE id = ?', [req.params.id]);
    if (conv.length === 0) return res.status(404).json({ message: 'Conversation not found.' });
    if (conv[0].buyer_id !== req.user.id && conv[0].seller_id !== req.user.id)
      return res.status(403).json({ message: 'Not authorized.' });

    const [result] = await db.query(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, content]
    );
    res.status(201).json({ id: result.insertId, conversation_id: req.params.id, sender_id: req.user.id, content, created_at: new Date() });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;

// GET /api/chat/unread-count — total unread messages for current user
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) as count
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.is_read = FALSE
        AND m.sender_id != ?
        AND (c.buyer_id = ? OR c.seller_id = ?)
    `, [req.user.id, req.user.id, req.user.id]);
    res.json({ count: rows[0].count || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ count: 0 });
  }
});
