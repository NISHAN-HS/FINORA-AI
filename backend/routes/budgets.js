const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

// GET budgets for a month
router.get('/', auth, async (req, res) => {
  try {
    const month = req.query.month || new Date().getMonth() + 1;
    const year  = req.query.year  || new Date().getFullYear();

    const [budgets] = await db.execute(
      'SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ?',
      [req.user.id, month, year]
    );

    // Get spent amounts per category
    const [spent] = await db.execute(
      `SELECT category, SUM(amount) as spent FROM expenses
       WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
       GROUP BY category`,
      [req.user.id, month, year]
    );

    const spentMap = {};
    spent.forEach(s => spentMap[s.category] = parseFloat(s.spent));

    const result = budgets.map(b => ({
      ...b,
      spent: spentMap[b.category] || 0,
      remaining: Math.max(0, b.amount - (spentMap[b.category] || 0)),
      percentage: Math.min(100, Math.round(((spentMap[b.category] || 0) / b.amount) * 100))
    }));

    res.json(result);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// POST set budget
router.post('/', auth, async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;
    await db.execute(
      `INSERT INTO budgets (user_id, category, amount, month, year)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = ?`,
      [req.user.id, category, amount, month, year, amount]
    );
    res.json({ message: 'Budget saved' });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

// DELETE budget
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM budgets WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
    res.json({ message: 'Budget deleted' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;