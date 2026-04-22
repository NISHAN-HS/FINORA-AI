const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper: get user's financial context
async function getFinancialContext(userId) {
  const month = new Date().getMonth() + 1;
  const year  = new Date().getFullYear();

  const [[{ totalIncome }]] = await db.execute(
    `SELECT COALESCE(SUM(amount), 0) as totalIncome FROM income WHERE user_id = ? AND MONTH(date)=? AND YEAR(date)=?`,
    [userId, month, year]
  );
  const [[{ totalExpenses }]] = await db.execute(
    `SELECT COALESCE(SUM(amount), 0) as totalExpenses FROM expenses WHERE user_id = ? AND MONTH(date)=? AND YEAR(date)=?`,
    [userId, month, year]
  );
  const [categories] = await db.execute(
    `SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? AND MONTH(date)=? AND YEAR(date)=? GROUP BY category`,
    [userId, month, year]
  );
  const [goals] = await db.execute('SELECT * FROM savings_goals WHERE user_id = ? AND is_completed = false', [userId]);

  return { totalIncome: parseFloat(totalIncome), totalExpenses: parseFloat(totalExpenses), categories, goals };
}

// POST /api/ai/chat
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const ctx = await getFinancialContext(req.user.id);

    // Save user message
    await db.execute('INSERT INTO chat_history (user_id, role, message) VALUES (?, ?, ?)', [req.user.id, 'user', message]);

    // Get recent chat history
    const [history] = await db.execute(
      'SELECT role, message FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.user.id]
    );

    const systemPrompt = `You are FinBot, an AI personal finance assistant. 
The user's current financial data this month:
- Total Income: ₹${ctx.totalIncome}
- Total Expenses: ₹${ctx.totalExpenses}  
- Remaining Balance: ₹${ctx.totalIncome - ctx.totalExpenses}
- Expense Breakdown: ${ctx.categories.map(c => `${c.category}: ₹${c.total}`).join(', ')}
- Active Savings Goals: ${ctx.goals.length}

Give specific, actionable financial advice based on this real data. Be concise and friendly.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.reverse().map(h => ({ role: h.role, content: h.message })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500
    });

    const reply = completion.choices[0].message.content;

    // Save AI reply
    await db.execute('INSERT INTO chat_history (user_id, role, message) VALUES (?, ?, ?)', [req.user.id, 'assistant', reply]);

    res.json({ reply });
  } catch (err) {
    // Fallback without OpenAI
    const fallbackReplies = [
      "Based on your spending patterns, I recommend setting aside 20% of your income as savings.",
      "Your food expenses seem high. Try meal planning to reduce costs by 15-20%.",
      "Consider automating your savings by setting up an auto-transfer on payday.",
      "Review your subscriptions — recurring small expenses add up significantly over time."
    ];
    res.json({ reply: fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)], fallback: true });
  }
});

// GET /api/ai/suggestions
router.get('/suggestions', auth, async (req, res) => {
  try {
    const ctx = await getFinancialContext(req.user.id);
    const savingsRate = ctx.totalIncome > 0
      ? ((ctx.totalIncome - ctx.totalExpenses) / ctx.totalIncome * 100).toFixed(1)
      : 0;

    const suggestions = [];

    // Rule-based suggestions (fallback)
    if (savingsRate < 20) {
      suggestions.push({ type: 'warning', title: 'Low Savings Rate', message: `Your savings rate is ${savingsRate}%. Aim for at least 20% of income.`, icon: '⚠️' });
    }

    ctx.categories.forEach(cat => {
      const pct = ctx.totalIncome > 0 ? (cat.total / ctx.totalIncome * 100).toFixed(1) : 0;
      if (cat.category === 'Food' && pct > 30) {
        suggestions.push({ type: 'alert', title: 'High Food Spending', message: `Food expenses are ${pct}% of your income. Reduce by 10% to save ₹${(cat.total * 0.1).toFixed(0)}/month.`, icon: '🍔' });
      }
      if (cat.category === 'Shopping' && pct > 20) {
        suggestions.push({ type: 'alert', title: 'Shopping Overspend', message: `Shopping is ${pct}% of income. Consider a 30-day no-spend challenge.`, icon: '🛍️' });
      }
    });

    if (ctx.totalExpenses > ctx.totalIncome) {
      suggestions.push({ type: 'danger', title: 'Deficit Alert!', message: `Spending ₹${(ctx.totalExpenses - ctx.totalIncome).toFixed(0)} more than income this month.`, icon: '🚨' });
    }

    if (suggestions.length === 0) {
      suggestions.push({ type: 'success', title: 'Great Financial Health!', message: `Savings rate of ${savingsRate}%. Keep it up!`, icon: '✅' });
    }

    // Try AI enhancement
    try {
      const prompt = `Given this financial data: Income ₹${ctx.totalIncome}, Expenses ₹${ctx.totalExpenses}, Categories: ${ctx.categories.map(c => `${c.category}:₹${c.total}`).join(', ')}. Give 3 specific actionable tips as JSON array with fields: type(info/warning/alert), title, message, icon(emoji).`;
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400
      });
      const aiText = completion.choices[0].message.content.replace(/```json|```/g, '').trim();
      const aiSuggestions = JSON.parse(aiText);
      suggestions.push(...aiSuggestions);
    } catch (e) { /* use rule-based */ }

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET chat history
router.get('/chat-history', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at ASC LIMIT 50', [req.user.id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;