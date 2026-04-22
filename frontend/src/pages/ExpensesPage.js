import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, X, TrendingDown } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['All','Food','Bills','Shopping','Transport','Health','Entertainment','Education','Others'];
const CATEGORY_ICONS = { Food:'🍔',Bills:'⚡',Shopping:'🛍️',Transport:'🚗',Health:'🏥',Entertainment:'🎬',Education:'📚',Others:'📦' };
const CATEGORY_COLORS = { Food:'badge-yellow',Bills:'badge-blue',Shopping:'badge-purple',Transport:'badge-green',Health:'badge-red',Entertainment:'badge-purple',Education:'badge-blue',Others:'badge-gray' };
const EMPTY_FORM = { title:'', amount:'', category:'Food', description:'', date: new Date().toISOString().split('T')[0], is_recurring: false };

export default function ExpensesPage() {
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [summary, setSummary]     = useState([]);

const fetch = useCallback(async () => {
  setLoading(true);
  try {
    const params = {};
    if (search) params.search = search;
    if (category !== 'All') params.category = category;

    const [expRes, sumRes] = await Promise.all([
      API.get('/expenses', { params }),
      API.get('/expenses/summary/category'),
    ]);

    console.log("Expenses response:", expRes.data);
    console.log("Summary response:", sumRes.data);

    setExpenses(expRes.data.expenses || []);
    setSummary(sumRes.data || []);
  } catch (err) {
    console.log("Expense API Error:", err.response?.data || err.message);
    toast.error(err.response?.data?.message || 'Failed to load expenses');
  } finally {
    setLoading(false);
  }
}, [search, category]);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd  = () => { setEditItem(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (e) => { setEditItem(e); setForm({ title: e.title, amount: e.amount, category: e.category, description: e.description || '', date: e.date?.split('T')[0] || '', is_recurring: e.is_recurring }); setModal(true); };
  const closeModal = () => { setModal(false); setEditItem(null); setForm(EMPTY_FORM); };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!form.title || !form.amount || !form.date) return toast.error('Fill required fields');
    setSaving(true);
    try {
      if (editItem) {
        await API.put(`/expenses/${editItem.id}`, form);
        toast.success('Expense updated!');
      } else {
        await API.post('/expenses', form);
        toast.success('Expense added!');
      }
      closeModal();
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await API.delete(`/expenses/${id}`);
      toast.success('Deleted!');
      fetch();
    } catch { toast.error('Delete failed'); }
  };

  const totalThisMonth = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Expense Tracker</h2>
          <p className="section-subtitle">Track and manage all your spending</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <p className="text-xs text-slate-400 mb-1">Total This Month</p>
          <p className="text-xl font-bold text-red-500">₹{totalThisMonth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        {summary.slice(0, 3).map(s => (
          <div key={s.category} className="card p-4 text-center">
            <p className="text-xs text-slate-400 mb-1">{CATEGORY_ICONS[s.category]} {s.category}</p>
            <p className="text-lg font-bold text-slate-700 dark:text-white">₹{parseFloat(s.total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search expenses..." className="input pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                category === c ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}>
              {c !== 'All' ? CATEGORY_ICONS[c] : '🔍'} {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400">
                  <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2" />
                  Loading...
                </td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12">
                  <TrendingDown className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No expenses found</p>
                  <button onClick={openAdd} className="mt-3 btn-primary text-sm">Add First Expense</button>
                </td></tr>
              ) : expenses.map(e => (
                <tr key={e.id}>
                  <td>
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{e.title}</p>
                      {e.description && <p className="text-xs text-slate-400 truncate max-w-[180px]">{e.description}</p>}
                    </div>
                  </td>
                  <td><span className={CATEGORY_COLORS[e.category] || 'badge-gray'}>{CATEGORY_ICONS[e.category]} {e.category}</span></td>
                  <td className="text-slate-500 text-sm">{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td><span className="font-bold text-red-500">₹{parseFloat(e.amount).toLocaleString('en-IN')}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(e)} className="btn-icon text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="btn-icon text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editItem ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button onClick={closeModal} className="btn-icon text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Title *</label>
                  <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="e.g. Grocery shopping" className="input" required />
                </div>
                <div>
                  <label className="label">Amount (₹) *</label>
                  <input type="number" min="0" step="0.01" value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}
                    placeholder="0.00" className="input" required />
                </div>
                <div>
                  <label className="label">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                    className="input" required />
                </div>
                <div className="col-span-2">
                  <label className="label">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="select">
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Description (optional)</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="Additional notes..." rows={2} className="input resize-none" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="recurring" checked={form.is_recurring}
                    onChange={e => setForm({...form, is_recurring: e.target.checked})}
                    className="w-4 h-4 rounded text-primary-600" />
                  <label htmlFor="recurring" className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer">Recurring expense</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editItem ? 'Update' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}