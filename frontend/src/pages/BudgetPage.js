import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X, Wallet, AlertTriangle } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Food','Bills','Shopping','Transport','Health','Entertainment','Education','Others','Total'];
const CAT_ICONS  = { Food:'🍔',Bills:'⚡',Shopping:'🛍️',Transport:'🚗',Health:'🏥',Entertainment:'🎬',Education:'📚',Others:'📦',Total:'💰' };
const now = new Date();

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ category:'Food', amount:'', month: now.getMonth()+1, year: now.getFullYear() });
  const [saving, setSaving]   = useState(false);
  const [month, setMonth]     = useState(now.getMonth()+1);
  const [year, setYear]       = useState(now.getFullYear());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const { data } = await API.get('/budgets', { params: { month, year } }); setBudgets(data); }
    catch { toast.error('Failed to load budgets'); }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const submit = async e => {
    e.preventDefault();
    if (!form.amount) return toast.error('Enter budget amount');
    setSaving(true);
    try {
      await API.post('/budgets', { ...form, month, year });
      toast.success('Budget saved!');
      setModal(false);
      fetchData();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!window.confirm('Delete budget?')) return;
    try { await API.delete(`/budgets/${id}`); toast.success('Deleted!'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const getBarColor = (pct) => {
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 80)  return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Budget Planner</h2>
          <p className="section-subtitle">Set and track your monthly spending limits</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={month} onChange={e => setMonth(e.target.value)} className="select w-auto">
            {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className="select w-auto">
            {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => setModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Set Budget
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"/></div>
      ) : budgets.length === 0 ? (
        <div className="card p-12 text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">No budgets set</h3>
          <p className="text-slate-400 text-sm mb-4">Set a budget for each category to control spending</p>
          <button onClick={() => setModal(true)} className="btn-primary">Set First Budget</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(b => (
            <div key={b.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{CAT_ICONS[b.category] || '📦'}</span>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{b.category}</p>
                    <p className="text-xs text-slate-400">
                      ₹{parseFloat(b.spent).toLocaleString('en-IN')} / ₹{parseFloat(b.amount).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {b.percentage >= 100 && (
                    <span className="badge badge-red"><AlertTriangle className="w-3 h-3"/>Over!</span>
                  )}
                  {b.percentage >= 80 && b.percentage < 100 && (
                    <span className="badge badge-yellow">⚠️ Near limit</span>
                  )}
                  <button onClick={() => del(b.id)} className="btn-icon text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="progress-bar mb-2">
                <div className={`progress-fill ${getBarColor(b.percentage)}`} style={{ width: `${b.percentage}%` }} />
              </div>

              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{b.percentage}% used</span>
                <span className={b.remaining === 0 ? 'text-red-500 font-semibold' : 'text-green-600 font-semibold'}>
                  {b.remaining > 0 ? `₹${parseFloat(b.remaining).toLocaleString('en-IN')} left` : 'Budget exceeded!'}
                </span>
              </div>

              {b.percentage >= 100 && (
                <div className="mt-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    ⚠️ You've exceeded your {b.category} budget by ₹{Math.abs(parseFloat(b.remaining)).toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Set Category Budget</h3>
              <button onClick={() => setModal(false)} className="btn-icon text-slate-400"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Category</label>
                <select value={form.category} onChange={e => setForm({...form,category:e.target.value})} className="select">
                  {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Monthly Budget (₹) *</label>
                <input type="number" min="0" step="0.01" value={form.amount}
                  onChange={e => setForm({...form,amount:e.target.value})} placeholder="e.g. 5000" className="input" required />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Budget'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}