import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Wallet, Target, Bell, ArrowRight,
  Sparkles, AlertTriangle, CheckCircle, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import API from "../services/api";
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4','#f97316','#64748b'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CATEGORY_ICONS = {
  Food:'🍔', Bills:'⚡', Shopping:'🛍️', Transport:'🚗',
  Health:'🏥', Entertainment:'🎬', Education:'📚', Others:'📦'
};

function StatCard({ title, value, subtitle, icon: Icon, gradient, trend, trendValue }) {
  return (
    <div className={`rounded-2xl p-6 text-white relative overflow-hidden ${gradient} shadow-lg`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-white/80">{title}</span>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="text-3xl font-bold mb-1">₹{parseFloat(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
        {subtitle && <p className="text-white/70 text-sm">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend === 'up' ? 'text-green-200' : 'text-red-200'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ₹{parseFloat(p.value).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, sugRes] = await Promise.all([
        API.get('/dashboard/summary'),
        API.get('/ai/suggestions').catch(() => ({ data: [] }))
      ]);
      setData(dashRes.data);
      setSuggestions(sugRes.data.slice(0, 3));
    }catch (err) {
  console.log("Dashboard Error:", err.response?.data || err.message);
  toast.error(err.response?.data?.message || "Failed to load dashboard");
       } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  const pieData = data?.categoryBreakdown?.map(c => ({
    name: c.category,
    value: parseFloat(c.total)
  })) || [];

  const trendData = data?.monthlyTrend?.map(t => ({
    name: MONTH_NAMES[t.month - 1],
    Income: parseFloat(t.income || 0),
    Expenses: parseFloat(t.expenses || 0),
  })) || [];

  const alertColor = { warning:'yellow', alert:'red', danger:'red', success:'green', info:'blue' };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Financial Overview</h2>
          <p className="section-subtitle">Here's what's happening with your money</p>
        </div>
        <button onClick={fetchData} className="btn-secondary gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Income"   value={data?.totalIncome}   icon={TrendingUp}   gradient="bg-income"  subtitle="This month" />
        <StatCard title="Total Expenses" value={data?.totalExpenses} icon={TrendingDown} gradient="bg-expense" subtitle="This month" />
        <StatCard title="Net Balance"    value={data?.balance}       icon={Wallet}       gradient="bg-balance" subtitle="Available balance" />
        <StatCard title="Savings Goals"  value={data?.savingsGoals?.total * 1000} icon={Target} gradient="bg-savings"
          subtitle={`${data?.savingsGoals?.completed || 0} of ${data?.savingsGoals?.total || 0} completed`} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Area chart */}
        <div className="xl:col-span-2 card p-6">
          <h3 className="section-title mb-4">Income vs Expenses Trend</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="Income"   stroke="#22c55e" strokeWidth={2.5} fill="url(#colorIncome)"   dot={{ fill: '#22c55e', r: 4 }} />
                <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2.5} fill="url(#colorExpenses)" dot={{ fill: '#ef4444', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-slate-400">
              <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Add income & expenses to see trends</p>
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="card p-6">
          <h3 className="section-title mb-4">Spending by Category</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => `₹${parseFloat(v).toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-600 dark:text-slate-300">
                        {CATEGORY_ICONS[item.name] || '📦'} {item.name}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      ₹{item.value.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center text-slate-400">
              <p className="text-sm">No expenses this month</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Suggestions */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <h3 className="section-title">AI Insights</h3>
            </div>
            <button onClick={() => navigate('/chatbot')} className="text-xs text-primary-600 font-medium hover:underline">
              Ask AI →
            </button>
          </div>
          <div className="space-y-3">
            {suggestions.length > 0 ? suggestions.map((s, i) => (
              <div key={i} className={`flex gap-3 p-3 rounded-xl border ${
                s.type === 'danger'  ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' :
                s.type === 'warning' || s.type === 'alert' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800' :
                'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800'
              }`}>
                <span className="text-xl flex-shrink-0">{s.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{s.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.message}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-slate-400">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Add transactions for AI insights</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Expenses</h3>
            <button onClick={() => navigate('/expenses')} className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {data?.recentExpenses?.length > 0 ? data.recentExpenses.map(e => (
              <div key={e.id} className="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-lg">
                    {CATEGORY_ICONS[e.category] || '📦'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{e.title}</p>
                    <p className="text-xs text-slate-400">{e.category} · {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-red-500">-₹{parseFloat(e.amount).toLocaleString('en-IN')}</span>
              </div>
            )) : (
              <p className="text-sm text-slate-400 text-center py-6">No recent expenses</p>
            )}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Upcoming Bills</h3>
            <button onClick={() => navigate('/reminders')} className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {data?.upcomingReminders?.length > 0 ? data.upcomingReminders.map(r => {
              const daysLeft = Math.ceil((new Date(r.due_date) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                  daysLeft <= 1 ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' :
                  daysLeft <= 3 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-800' :
                  'bg-slate-50 dark:bg-slate-700/40 border-slate-100 dark:border-slate-700'
                }`}>
                  <Bell className={`w-4 h-4 flex-shrink-0 ${daysLeft <= 1 ? 'text-red-500' : daysLeft <= 3 ? 'text-yellow-500' : 'text-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{r.title}</p>
                    <p className="text-xs text-slate-400">
                      {daysLeft === 0 ? '⚠️ Due today' : daysLeft === 1 ? '⚠️ Due tomorrow' : `Due in ${daysLeft} days`}
                    </p>
                  </div>
                  {r.amount && <span className="text-sm font-bold text-slate-600 dark:text-slate-300">₹{parseFloat(r.amount).toLocaleString('en-IN')}</span>}
                </div>
              );
            }) : (
              <div className="text-center py-6 text-slate-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No upcoming bills</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}