import React, { useState, useEffect, useCallback } from 'react';
import { Users, BarChart3, ShieldCheck, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [users, setUsers]   = useState([]);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/stats'),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleUser = async id => {
    try { await API.put(`/admin/users/${id}/toggle`); toast.success('Status updated'); fetchData(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-orange-500"/> Admin Panel
          </h2>
          <p className="section-subtitle">Manage users and view system analytics</p>
        </div>
        <button onClick={fetchData} className="btn-secondary"><RefreshCw className="w-4 h-4"/> Refresh</button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:'Total Users',    value: stats.totalUsers,    icon:'👤', color:'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
            { label:'Total Expenses', value: stats.totalExpenses, icon:'💸', color:'bg-red-50 dark:bg-red-900/20 text-red-600' },
            { label:'Total Incomes',  value: stats.totalIncome,   icon:'💰', color:'bg-green-50 dark:bg-green-900/20 text-green-600' },
            { label:'Savings Goals',  value: stats.totalGoals,    icon:'🎯', color:'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
          ].map(s => (
            <div key={s.label} className={`card p-5 ${s.color}`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm font-medium opacity-80 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Users table */}
      <div className="card">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500"/> User Management
          </h3>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">
                  <div className="w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2"/>Loading...
                </td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold">
                        {u.name?.[0]?.toUpperCase()||'U'}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-slate-500 text-sm">{u.email}</td>
                  <td>
                    <span className={u.role === 'admin' ? 'badge badge-red' : 'badge badge-blue'}>{u.role}</span>
                  </td>
                  <td className="text-slate-500 text-sm">{new Date(u.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</td>
                  <td>
                    <span className={u.is_active ? 'badge badge-green' : 'badge badge-red'}>
                      {u.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => toggleUser(u.id)}
                      className={`btn-icon ${u.is_active ? 'text-green-500 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`}
                      title={u.is_active ? 'Deactivate user' : 'Activate user'}>
                      {u.is_active
                        ? <ToggleRight className="w-5 h-5"/>
                        : <ToggleLeft className="w-5 h-5"/>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}