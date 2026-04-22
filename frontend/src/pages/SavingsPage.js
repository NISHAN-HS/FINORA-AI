import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Target, CheckCircle } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const EMPTY = { title:'', target_amount:'', current_amount:'0', deadline:'', category:'General', description:'' };

function CircularProgress({ percentage, size = 120 }) {
  const r = (size - 12) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (percentage / 100) * circumference;
  const color = percentage >= 100 ? '#22c55e' : percentage >= 60 ? '#3b82f6' : '#f59e0b';
  return (
    <svg width={size} height={size} className="circular-progress">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={10} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }} />
    </svg>
  );
}

export default function SavingsPage() {
  const [goals, setGoals]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [editItem, setEdit] = useState(null);
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const { data } = await API.get('/savings'); setGoals(data); }
    catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd  = () => { setEdit(null); setForm(EMPTY); setModal(true); };
  const openEdit = (g) => {
    setEdit(g);
    setForm({ title:g.title, target_amount:g.target_amount, current_amount:g.current_amount, deadline:g.deadline?.split('T')[0]||'', category:g.category||'General', description:g.description||'' });
    setModal(true);
  };
  const close = () => { setModal(false); setEdit(null); setForm(EMPTY); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.target_amount || !form.deadline) return toast.error('Fill required fields');
    setSaving(true);
    try {
      if (editItem) { await API.put(`/savings/${editItem.id}`, form); toast.success('Goal updated!'); }
      else { await API.post('/savings', form); toast.success('Goal created!'); }
      close(); fetchData();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!window.confirm('Delete goal?')) return;
    try { await API.delete(`/savings/${id}`); toast.success('Deleted!'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const getDaysLeft = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000*60*60*24));
    return days;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Savings Goals</h2>
          <p className="section-subtitle">Set goals and track your progress</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4"/> Add Goal</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"/></div>
      ) : goals.length === 0 ? (
        <div className="card p-12 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-slate-700"/>
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">No goals yet</h3>
          <p className="text-slate-400 text-sm mb-4">Set your first savings goal to start your journey</p>
          <button onClick={openAdd} className="btn-primary">Create Goal</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(g => {
            const pct   = Math.min(100, Math.round((parseFloat(g.current_amount) / parseFloat(g.target_amount)) * 100));
            const days  = getDaysLeft(g.deadline);
            const done  = g.is_completed || pct >= 100;
            return (
              <div key={g.id} className={`card p-5 relative ${done ? 'ring-2 ring-green-300 dark:ring-green-700' : ''}`}>
                {done && (
                  <div className="absolute top-3 right-3">
                    <span className="badge badge-green"><CheckCircle className="w-3 h-3"/>Achieved!</span>
                  </div>
                )}
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="relative w-28 h-28 mb-3">
                    <CircularProgress percentage={pct} size={112} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-slate-700 dark:text-white">{pct}%</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{g.title}</h3>
                  <span className="badge-blue text-xs mt-1">{g.category}</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Saved</span>
                    <span className="font-semibold text-green-600">₹{parseFloat(g.current_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">₹{parseFloat(g.target_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Remaining</span>
                    <span className="font-semibold text-primary-600">₹{Math.max(0, parseFloat(g.target_amount) - parseFloat(g.current_amount)).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deadline</span>
                    <span className={`font-semibold ${days < 0 ? 'text-red-500' : days < 30 ? 'text-yellow-600' : 'text-slate-600 dark:text-slate-300'}`}>
                      {days < 0 ? '⚠️ Overdue' : days === 0 ? 'Today!' : `${days} days left`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => openEdit(g)} className="btn-secondary flex-1 text-sm py-2">
                    <Edit2 className="w-3.5 h-3.5"/> Edit
                  </button>
                  <button onClick={() => del(g.id)} className="btn-icon text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editItem ? 'Edit Goal' : 'New Savings Goal'}</h3>
              <button onClick={close} className="btn-icon text-slate-400"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div><label className="label">Goal Title *</label><input value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Save for laptop" className="input" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Target Amount (₹) *</label><input type="number" min="0" value={form.target_amount} onChange={e => setForm({...form,target_amount:e.target.value})} placeholder="10000" className="input" required /></div>
                <div><label className="label">Current Saved (₹)</label><input type="number" min="0" value={form.current_amount} onChange={e => setForm({...form,current_amount:e.target.value})} placeholder="0" className="input" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Deadline *</label><input type="date" value={form.deadline} onChange={e => setForm({...form,deadline:e.target.value})} className="input" required /></div>
                <div><label className="label">Category</label><input value={form.category} onChange={e => setForm({...form,category:e.target.value})} placeholder="e.g. Travel" className="input" /></div>
              </div>
              <div><label className="label">Description</label><textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} className="input resize-none" rows={2} /></div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={close} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editItem ? 'Update' : 'Create Goal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}