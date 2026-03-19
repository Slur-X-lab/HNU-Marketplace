const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// GET /api/products - list all with optional search/filter
router.get('/', async (req, res) => {
  const { search, category, condition, min_price, max_price, sort = 'newest' } = req.query;
  try {
    let query = `
      SELECT p.*, u.name AS seller_name, u.avatar AS seller_avatar, c.name AS category_name
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'available'
    `;
    const params = [];

    if (search) { query += ' AND (p.title LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (category) { query += ' AND p.category_id = ?'; params.push(category); }
    if (condition) { query += ' AND p.condition_type = ?'; params.push(condition); }
    if (min_price) { query += ' AND p.price >= ?'; params.push(min_price); }
    if (max_price) { query += ' AND p.price <= ?'; params.push(max_price); }

    if (sort === 'price_asc') query += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY p.price DESC';
    else query += ' ORDER BY p.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.name AS seller_name, u.avatar AS seller_avatar, u.email AS seller_email,
             u.course AS seller_course, c.name AS category_name
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/products - create listing
router.post('/', authMiddleware, upload.array('images', 5), async (req, res) => {
  const { title, description, price, category_id, condition_type } = req.body;
  if (!title || !price) return res.status(400).json({ message: 'Title and price are required.' });

  const images = req.files ? req.files.map(f => f.path) : [];

  try {
    const [result] = await db.query(
      'INSERT INTO products (seller_id, category_id, title, description, price, condition_type, images) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, category_id || null, title, description, price, condition_type || 'good', JSON.stringify(images)]
    );
    res.status(201).json({ message: 'Product listed!', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/products/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found.' });
    if (rows[0].seller_id !== req.user.id) return res.status(403).json({ message: 'Not authorized.' });

    const current = rows[0];
    const title = req.body.title ?? current.title;
    const description = req.body.description ?? current.description;
    const price = req.body.price ?? current.price;
    const category_id = req.body.category_id ?? current.category_id;
    const condition_type = req.body.condition_type ?? current.condition_type;
    const status = req.body.status ?? current.status;

    await db.query(
      'UPDATE products SET title=?, description=?, price=?, category_id=?, condition_type=?, status=? WHERE id=?',
      [title, description, price, category_id, condition_type, status, req.params.id]
    );
    res.json({ message: 'Product updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT seller_id FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found.' });
    if (rows[0].seller_id !== req.user.id) return res.status(403).json({ message: 'Not authorized.' });

    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/products/user/my-listings
router.get('/user/my-listings', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.seller_id = ? ORDER BY p.created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
