// ============================================================
// INCOME ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = 'SELECT * FROM income WHERE user_id = ?';
    const params = [req.user.id];
    if (month) { query += ' AND MONTH(date) = ?'; params.push(month); }
    if (year)  { query += ' AND YEAR(date) = ?';  params.push(year); }
    query += ' ORDER BY date DESC';
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, amount, category, description, date } = req.body;
    const [result] = await db.execute(
      'INSERT INTO income (user_id, title, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title, amount, category || 'Others', description, date]
    );
    const [rows] = await db.execute('SELECT * FROM income WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, amount, category, description, date } = req.body;
    await db.execute(
      'UPDATE income SET title=?, amount=?, category=?, description=?, date=? WHERE id=? AND user_id=?',
      [title, amount, category, description, date, req.params.id, req.user.id]
    );
    res.json({ message: 'Income updated' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM income WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Income deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/summary/monthly', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT MONTH(date) as month, YEAR(date) as year, SUM(amount) as total, category
       FROM income WHERE user_id = ?
       GROUP BY YEAR(date), MONTH(date), category
       ORDER BY year DESC, month DESC LIMIT 12`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;