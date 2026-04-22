const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { adminAuth } = require('../middleware/auth');

router.get('/users', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.execute('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalExpenses }]] = await db.execute('SELECT COUNT(*) as totalExpenses FROM expenses');
    const [[{ totalIncome }]] = await db.execute('SELECT COUNT(*) as totalIncome FROM income');
    const [[{ totalGoals }]] = await db.execute('SELECT COUNT(*) as totalGoals FROM savings_goals');
    res.json({ totalUsers, totalExpenses, totalIncome, totalGoals });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

router.put('/users/:id/toggle', adminAuth, async (req, res) => {
  try {
    await db.execute('UPDATE users SET is_active = NOT is_active WHERE id = ?', [req.params.id]);
    res.json({ message: 'User status toggled' });
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;