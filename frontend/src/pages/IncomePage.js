// ============================================================
// IncomePage.js
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, TrendingUp } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const INCOME_CATS = ['Salary','Freelance','Side Income','Investment','Gift','Others'];
const CAT_ICONS = { Salary:'💼', Freelance:'💻', 'Side Income':'💡', Investment:'📈', Gift:'🎁', Others:'💰' };
const EMPTY = { title:'', amount:'', category:'Salary', description:'', date: new Date().toISOString().split('T')[0] };

export function IncomePage() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);
  const [editItem, setEdit] = useState(null);
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const { data } = await API.get('/income'); setItems(data); }
    catch { toast.error('Failed to load income'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd  = () => { setEdit(null); setForm(EMPTY); setModal(true); };
  const openEdit = (it) => { setEdit(it); setForm({ title: it.title, amount: it.amount, category: it.category, description: it.description || '', date: it.date?.split('T')[0] || '' }); setModal(true); };
  const close    = () => { setModal(false); setEdit(null); setForm(EMPTY); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.date) return toast.error('Fill required fields');
    setSaving(true);
    try {
      if (editItem) { await API.put(`/income/${editItem.id}`, form); toast.success('Updated!'); }
      else          { await API.post('/income', form); toast.success('Income added!'); }
      close(); fetchData();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await API.delete(`/income/${id}`); toast.success('Deleted!'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const total = items.reduce((s, i) => s + parseFloat(i.amount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Income Manager</h2>
          <p className="section-subtitle">Track all your income sources</p>
        </div>
        <button onClick={openAdd} className="btn-success"><Plus className="w-4 h-4" /> Add Income</button>
      </div>

      <div className="card p-6 bg-income text-white">
        <p className="text-white/80 text-sm mb-1">Total Income This Month</p>
        <p className="text-4xl font-bold">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Amount</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10">
                  <TrendingUp className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                  <p className="text-slate-400 text-sm mb-2">No income records yet</p>
                  <button onClick={openAdd} className="btn-success text-sm">Add Income</button>
                </td></tr>
              ) : items.map(it => (
                <tr key={it.id}>
                  <td><p className="font-medium">{it.title}</p></td>
                  <td><span className="badge-green">{CAT_ICONS[it.category]} {it.category}</span></td>
                  <td className="text-slate-500 text-sm">{new Date(it.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</td>
                  <td><span className="font-bold text-green-500">+₹{parseFloat(it.amount).toLocaleString('en-IN')}</span></td>
                  <td><div className="flex gap-1">
                    <button onClick={() => openEdit(it)} className="btn-icon text-blue-500"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => del(it.id)} className="btn-icon text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editItem ? 'Edit Income' : 'Add Income'}</h3>
              <button onClick={close} className="btn-icon text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div><label className="label">Title *</label><input value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Monthly salary" className="input" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Amount (₹) *</label><input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({...form,amount:e.target.value})} placeholder="0.00" className="input" required /></div>
                <div><label className="label">Date *</label><input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} className="input" required /></div>
              </div>
              <div><label className="label">Category</label>
                <select value={form.category} onChange={e => setForm({...form,category:e.target.value})} className="select">
                  {INCOME_CATS.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                </select>
              </div>
              <div><label className="label">Description</label><textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})} className="input resize-none" rows={2} /></div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={close} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-success flex-1">{saving ? 'Saving...' : editItem ? 'Update' : 'Add Income'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncomePage;