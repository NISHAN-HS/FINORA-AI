// RemindersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Bell, CheckCircle, Trash2, X, Edit2 } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const CATS = ['Bill','EMI','Credit Card','Insurance','Subscription','Others'];
const EMPTY = { title:'', amount:'', due_date: new Date().toISOString().split('T')[0], category:'Bill', notes:'', is_recurring:false, recurring_type:'monthly' };

export function RemindersPage() {
  const [items, setItems]   = useState([]);
  const [modal, setModal]   = useState(false);
  const [editItem, setEdit] = useState(null);
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const { data } = await API.get('/reminders'); setItems(data); }
    catch { toast.error('Failed to load reminders'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd  = () => { setEdit(null); setForm(EMPTY); setModal(true); };
  const openEdit = it => { setEdit(it); setForm({ title:it.title, amount:it.amount||'', due_date:it.due_date?.split('T')[0]||'', category:it.category, notes:it.notes||'', is_recurring:it.is_recurring, recurring_type:it.recurring_type||'monthly' }); setModal(true); };
  const close    = () => { setModal(false); setEdit(null); setForm(EMPTY); };

  const submit = async e => {
    e.preventDefault();
    if (!form.title || !form.due_date) return toast.error('Fill required fields');
    setSaving(true);
    try {
      if (editItem) { await API.put(`/reminders/${editItem.id}`, form); toast.success('Updated!'); }
      else { await API.post('/reminders', form); toast.success('Reminder added!'); }
      close(); fetchData();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const markPaid = async id => {
    try { await API.put(`/reminders/${id}`, { is_paid: true }); toast.success('Marked as paid!'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const del = async id => {
    if (!window.confirm('Delete?')) return;
    try { await API.delete(`/reminders/${id}`); toast.success('Deleted!'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  const getDays = due => Math.ceil((new Date(due) - new Date()) / (1000*60*60*24));

  const unpaid = items.filter(r => !r.is_paid);
  const paid   = items.filter(r =>  r.is_paid);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="section-title">Bill Reminders</h2><p className="section-subtitle">Never miss a payment again</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4"/> Add Reminder</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"/></div>
      ) : (
        <>
          {unpaid.length === 0 && paid.length === 0 && (
            <div className="card p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-slate-700"/>
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">No reminders</h3>
              <button onClick={openAdd} className="btn-primary">Add First Reminder</button>
            </div>
          )}

          {unpaid.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-600 dark:text-slate-300">Upcoming ({unpaid.length})</h3>
              {unpaid.map(r => {
                const days = getDays(r.due_date);
                return (
                  <div key={r.id} className={`card p-4 flex items-center justify-between gap-4 border-l-4 ${
                    days < 0 ? 'border-red-500' : days <= 3 ? 'border-yellow-500' : 'border-primary-500'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Bell className={`w-5 h-5 flex-shrink-0 ${days < 0 ? 'text-red-500' : days <= 3 ? 'text-yellow-500' : 'text-primary-500'}`}/>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{r.title}</p>
                        <p className="text-sm text-slate-400">{r.category} · Due: {new Date(r.due_date).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {r.amount && <span className="font-bold text-slate-700 dark:text-slate-200">₹{parseFloat(r.amount).toLocaleString('en-IN')}</span>}
                      <span className={`badge text-xs ${days < 0 ? 'badge-red' : days <= 3 ? 'badge-yellow' : 'badge-blue'}`}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today!' : `${days}d left`}
                      </span>
                      <button onClick={() => markPaid(r.id)} title="Mark paid" className="btn-icon text-green-500 hover:bg-green-50"><CheckCircle className="w-4 h-4"/></button>
                      <button onClick={() => openEdit(r)} className="btn-icon text-blue-500"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={() => del(r.id)} className="btn-icon text-red-400"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {paid.length > 0 && (
            <div className="space-y-2 opacity-60">
              <h3 className="font-semibold text-slate-400 text-sm">Paid ({paid.length})</h3>
              {paid.map(r => (
                <div key={r.id} className="card p-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0"/>
                    <span className="text-sm text-slate-500 line-through">{r.title}</span>
                  </div>
                  <button onClick={() => del(r.id)} className="btn-icon text-red-400 text-xs"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editItem ? 'Edit Reminder' : 'Add Reminder'}</h3>
              <button onClick={close} className="btn-icon text-slate-400"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div><label className="label">Title *</label><input value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Electricity bill" className="input" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Amount (₹)</label><input type="number" value={form.amount} onChange={e => setForm({...form,amount:e.target.value})} placeholder="Optional" className="input"/></div>
                <div><label className="label">Due Date *</label><input type="date" value={form.due_date} onChange={e => setForm({...form,due_date:e.target.value})} className="input" required /></div>
              </div>
              <div><label className="label">Category</label>
                <select value={form.category} onChange={e => setForm({...form,category:e.target.value})} className="select">
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="rec" checked={form.is_recurring} onChange={e => setForm({...form,is_recurring:e.target.checked})} className="w-4 h-4 rounded"/>
                <label htmlFor="rec" className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer">Recurring</label>
                {form.is_recurring && (
                  <select value={form.recurring_type} onChange={e => setForm({...form,recurring_type:e.target.value})} className="select ml-2 w-auto">
                    {['daily','weekly','monthly','yearly'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                )}
              </div>
              <div><label className="label">Notes</label><textarea value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} className="input resize-none" rows={2}/></div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={close} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editItem ? 'Update' : 'Add Reminder'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RemindersPage;