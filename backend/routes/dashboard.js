const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');

router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const month = req.query.month || new Date().getMonth() + 1;
    const year = req.query.year || new Date().getFullYear();

    // Total income this month
    const [[{ totalIncome }]] = await db.execute(
      `SELECT COALESCE(SUM(amount), 0) AS totalIncome
       FROM income
       WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
      [userId, month, year]
    );

    // Total expenses this month
    const [[{ totalExpenses }]] = await db.execute(
      `SELECT COALESCE(SUM(amount), 0) AS totalExpenses
       FROM expenses
       WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
      [userId, month, year]
    );

    // Savings goals
    const [goals] = await db.execute(
      `SELECT 
          COUNT(*) AS total,
          COALESCE(SUM(is_completed), 0) AS completed
       FROM savings_goals
       WHERE user_id = ?`,
      [userId]
    );

    // Upcoming reminders
    const [reminders] = await db.execute(
      `SELECT *
       FROM reminders
       WHERE user_id = ?
         AND is_paid = false
         AND due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       ORDER BY due_date ASC
       LIMIT 5`,
      [userId]
    );

    // Recent expenses
    const [recentExpenses] = await db.execute(
      `SELECT *
       FROM expenses
       WHERE user_id = ?
       ORDER BY date DESC
       LIMIT 5`,
      [userId]
    );

    // Category breakdown
    const [categoryBreakdown] = await db.execute(
      `SELECT 
          category,
          COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
       GROUP BY category`,
      [userId, month, year]
    );

    // Monthly trend (FIXED QUERY)
const [monthlyTrend] = await db.execute(
  `SELECT 
      months.year,
      months.month,
      COALESCE(expenses.expenses, 0) AS expenses,
      COALESCE(income.income, 0) AS income
   FROM
     (
       SELECT YEAR(date) AS year, MONTH(date) AS month
       FROM expenses
       WHERE user_id = ?
       GROUP BY YEAR(date), MONTH(date)

       UNION

       SELECT YEAR(date) AS year, MONTH(date) AS month
       FROM income
       WHERE user_id = ?
       GROUP BY YEAR(date), MONTH(date)
     ) AS months

   LEFT JOIN
     (
       SELECT YEAR(date) AS year, MONTH(date) AS month, SUM(amount) AS expenses
       FROM expenses
       WHERE user_id = ?
       GROUP BY YEAR(date), MONTH(date)
     ) AS expenses
   ON months.year = expenses.year AND months.month = expenses.month

   LEFT JOIN
     (
       SELECT YEAR(date) AS year, MONTH(date) AS month, SUM(amount) AS income
       FROM income
       WHERE user_id = ?
       GROUP BY YEAR(date), MONTH(date)
     ) AS income
   ON months.year = income.year AND months.month = income.month

   ORDER BY months.year DESC, months.month DESC
   LIMIT 6`,
  [userId, userId, userId, userId]
);

    // Notifications
    const [[{ unreadNotifications }]] = await db.execute(
      `SELECT COUNT(*) AS unreadNotifications
       FROM notifications
       WHERE user_id = ? AND is_read = false`,
      [userId]
    );

    res.json({
      totalIncome: parseFloat(totalIncome),
      totalExpenses: parseFloat(totalExpenses),
      balance: parseFloat(totalIncome) - parseFloat(totalExpenses),
      savingsGoals: goals[0],
      upcomingReminders: reminders,
      recentExpenses,
      categoryBreakdown,
      monthlyTrend: monthlyTrend.reverse(),
      unreadNotifications
    });

  } catch (err) {
  console.error("FULL DASHBOARD ERROR:", err);
  res.status(500).json({
    message: err.message,
    error: err
  });
}
});

module.exports = router;