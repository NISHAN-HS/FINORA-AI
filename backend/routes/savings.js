const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM savings_goals WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, target_amount, current_amount, deadline, category, description } = req.body;
    const [result] = await db.execute(
      'INSERT INTO savings_goals (user_id, title, target_amount, current_amount, deadline, category, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title, target_amount, current_amount || 0, deadline, category, description]
    );
    const [rows] = await db.execute('SELECT * FROM savings_goals WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, target_amount, current_amount, deadline, category, description } = req.body;
    const is_completed = current_amount >= target_amount;
    await db.execute(
      'UPDATE savings_goals SET title=?, target_amount=?, current_amount=?, deadline=?, category=?, description=?, is_completed=? WHERE id=? AND user_id=?',
      [title, target_amount, current_amount, deadline, category, description, is_completed, req.params.id, req.user.id]
    );
    res.json({ message: 'Goal updated' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM savings_goals WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Goal deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;