// reminders.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM reminders WHERE user_id = ? ORDER BY due_date ASC', [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, amount, due_date, category, is_recurring, recurring_type, notes } = req.body;
    const [result] = await db.execute(
      'INSERT INTO reminders (user_id, title, amount, due_date, category, is_recurring, recurring_type, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title, amount, due_date, category, is_recurring, recurring_type, notes]
    );
    const [rows] = await db.execute('SELECT * FROM reminders WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, amount, due_date, category, is_paid, notes } = req.body;
    await db.execute(
      'UPDATE reminders SET title=?, amount=?, due_date=?, category=?, is_paid=?, notes=? WHERE id=? AND user_id=?',
      [title, amount, due_date, category, is_paid, notes, req.params.id, req.user.id]
    );
    res.json({ message: 'Reminder updated' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM reminders WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Reminder deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;