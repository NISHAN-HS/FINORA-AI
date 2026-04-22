const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');


// =========================
// GET ALL EXPENSES
// =========================
router.get('/', auth, async (req, res) => {
  try {
    const {
      category,
      startDate,
      endDate,
      search,
      limit = 50,
      offset = 0
    } = req.query;

    let query = `SELECT * FROM expenses WHERE user_id = ?`;
    let params = [req.user.id];

    if (category && category !== 'All') {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (startDate) {
      query += ` AND date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND date <= ?`;
      params.push(endDate);
    }

    if (search) {
      query += ` AND title LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY date DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const [rows] = await db.execute(query, params);

    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM expenses WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({
      expenses: rows,
      total
    });

  } catch (err) {
    console.error("GET EXPENSES ERROR:", err.message);
    res.status(500).json({
      message: err.message
    });
  }
});


// =========================
// ADD EXPENSE
// =========================
router.post('/', auth, async (req, res) => {
  try {
    const { title, amount, category, description, date, is_recurring } = req.body;

    if (!title || !amount || !date) {
      return res.status(400).json({
        message: 'Title, amount and date are required'
      });
    }

    const [result] = await db.execute(
      `INSERT INTO expenses 
      (user_id, title, amount, category, description, date, is_recurring)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title,
        amount,
        category || 'Others',
        description || null,
        date,
        is_recurring || false
      ]
    );

    await checkBudgetAlert(req.user.id, category || 'Others');

    const [rows] = await db.execute(
      `SELECT * FROM expenses WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);

  } catch (err) {
    console.error("ADD EXPENSE ERROR:", err.message);
    res.status(500).json({
      message: err.message
    });
  }
});


// =========================
// UPDATE EXPENSE
// =========================
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, amount, category, description, date } = req.body;

    const [existing] = await db.execute(
      `SELECT id FROM expenses WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!existing.length) {
      return res.status(404).json({
        message: 'Expense not found'
      });
    }

    await db.execute(
      `UPDATE expenses
       SET title=?, amount=?, category=?, description=?, date=?
       WHERE id=?`,
      [title, amount, category, description, date, req.params.id]
    );

    res.json({
      message: 'Expense updated'
    });

  } catch (err) {
    console.error("UPDATE EXPENSE ERROR:", err.message);
    res.status(500).json({
      message: err.message
    });
  }
});


// =========================
// DELETE EXPENSE
// =========================
router.delete('/:id', auth, async (req, res) => {
  try {
    const [existing] = await db.execute(
      `SELECT id FROM expenses WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!existing.length) {
      return res.status(404).json({
        message: 'Expense not found'
      });
    }

    await db.execute(
      `DELETE FROM expenses WHERE id = ?`,
      [req.params.id]
    );

    res.json({
      message: 'Expense deleted'
    });

  } catch (err) {
    console.error("DELETE EXPENSE ERROR:", err.message);
    res.status(500).json({
      message: err.message
    });
  }
});


// =========================
// GET EXPENSE SUMMARY BY CATEGORY
// =========================
router.get('/summary/category', auth, async (req, res) => {
  try {
    const month = req.query.month || new Date().getMonth() + 1;
    const year = req.query.year || new Date().getFullYear();

    const [rows] = await db.execute(
      `SELECT category, SUM(amount) AS total, COUNT(*) AS count
       FROM expenses
       WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
       GROUP BY category`,
      [req.user.id, month, year]
    );

    res.json(rows);

  } catch (err) {
    console.error("CATEGORY SUMMARY ERROR:", err.message);
    res.status(500).json({
      message: err.message
    });
  }
});


// =========================
// GET MONTHLY EXPENSE SUMMARY
// =========================
router.get('/summary/monthly', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT MONTH(date) AS month,
              YEAR(date) AS year,
              SUM(amount) AS total
       FROM expenses
       WHERE user_id = ?
       GROUP BY YEAR(date), MONTH(date)
       ORDER BY year DESC, month DESC
       LIMIT 12`,
      [req.user.id]
    );

    res.json(rows);

  } catch (err) {
    console.error("MONTHLY SUMMARY ERROR:", err.message);
    res.status(500).json({
      message: err.message
    });
  }
});


// =========================
// BUDGET ALERT CHECK
// =========================
async function checkBudgetAlert(userId, category) {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [[budget]] = await db.execute(
      `SELECT amount FROM budgets
       WHERE user_id = ? AND category = ? AND month = ? AND year = ?`,
      [userId, category, month, year]
    );

    if (!budget) return;

    const [[{ spent }]] = await db.execute(
      `SELECT COALESCE(SUM(amount),0) AS spent
       FROM expenses
       WHERE user_id = ? AND category = ?
       AND MONTH(date) = ? AND YEAR(date) = ?`,
      [userId, category, month, year]
    );

    if (spent > budget.amount) {
      const over = (spent - budget.amount).toFixed(2);

      await db.execute(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES (?, ?, ?, ?)`,
        [
          userId,
          `Budget Exceeded: ${category}`,
          `You exceeded your ${category} budget by ₹${over}`,
          'budget_alert'
        ]
      );
    }

  } catch (err) {
    console.error("BUDGET ALERT ERROR:", err.message);
  }
}

module.exports = router;