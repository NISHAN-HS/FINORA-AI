import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#a855f7','#06b6d4','#f97316','#64748b'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const Tooltip_ = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold mb-1 text-slate-700 dark:text-slate-200">{label}</p>
      {payload.map(p => <p key={p.name} style={{color:p.color}}>{p.name}: ₹{parseFloat(p.value).toLocaleString('en-IN')}</p>)}
    </div>
  );
};

export default function AnalyticsPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth]   = useState(new Date().getMonth()+1);
  const [year, setYear]     = useState(new Date().getFullYear());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, catRes, monthlyRes] = await Promise.all([
        API.get('/dashboard/summary', { params: { month, year } }),
        API.get('/expenses/summary/category', { params: { month, year } }),
        API.get('/expenses/summary/monthly'),
      ]);
      setData({ summary: dashRes.data, categories: catRes.data, monthly: monthlyRes.data });
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const downloadReport = async () => {
    try {
      const res = await API.get('/reports/pdf', { params: { month, year }, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `finance-report-${year}-${month}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch { toast.error('Failed to generate report'); }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"/></div>
  );

  const pieData = data?.categories?.map(c => ({ name: c.category, value: parseFloat(c.total) })) || [];
  const monthlyData = data?.monthly?.map(m => ({
    name: MONTHS[m.month-1],
    Expenses: parseFloat(m.total || 0),
  })).reverse() || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Analytics & Reports</h2>
          <p className="section-subtitle">Detailed financial insights and trends</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={month} onChange={e => setMonth(e.target.value)} className="select w-auto">
            {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className="select w-auto">
            {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={downloadReport} className="btn-primary">
            <Download className="w-4 h-4"/> PDF Report
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Income',   value: data?.summary?.totalIncome,   color:'text-green-600',  bg:'bg-green-50 dark:bg-green-900/20' },
          { label:'Total Expenses', value: data?.summary?.totalExpenses, color:'text-red-600',    bg:'bg-red-50 dark:bg-red-900/20' },
          { label:'Net Balance',    value: data?.summary?.balance,       color:'text-blue-600',   bg:'bg-blue-50 dark:bg-blue-900/20' },
          { label:'Savings Rate',   value: data?.summary?.totalIncome > 0 ? ((data?.summary?.balance / data?.summary?.totalIncome)*100).toFixed(1)+'%' : '0%', color:'text-purple-600', bg:'bg-purple-50 dark:bg-purple-900/20' },
        ].map(s => (
          <div key={s.label} className={`card p-5 ${s.bg}`}>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>
              {typeof s.value === 'string' ? s.value : `₹${parseFloat(s.value || 0).toLocaleString('en-IN', { maximumFractionDigits:0 })}`}
            </p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expenses Bar */}
        <div className="card p-6">
          <h3 className="section-title mb-4">Monthly Expense Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="name" tick={{fontSize:12, fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:12, fill:'#94a3b8'}} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${v>=1000?`${(v/1000).toFixed(0)}K`:v}`}/>
              <Tooltip content={<Tooltip_/>}/>
              <Bar dataKey="Expenses" fill="#ef4444" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="card p-6">
          <h3 className="section-title mb-4">Expense by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v => `₹${parseFloat(v).toLocaleString('en-IN')}`}/>
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-60 flex items-center justify-center text-slate-400 text-sm">No data for this period</div>}
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="card p-6">
        <h3 className="section-title mb-4">Category Breakdown</h3>
        {pieData.length > 0 ? (
          <div className="space-y-3">
            {pieData.map((item, i) => {
              const total = pieData.reduce((s,c) => s+c.value, 0);
              const pct = total > 0 ? Math.round((item.value/total)*100) : 0;
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:COLORS[i%COLORS.length]}}/>
                  <span className="text-sm text-slate-600 dark:text-slate-300 w-28">{item.name}</span>
                  <div className="flex-1 progress-bar">
                    <div className="progress-fill" style={{width:`${pct}%`, background:COLORS[i%COLORS.length]}}/>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 w-24 text-right">₹{item.value.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-400 w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        ) : <p className="text-slate-400 text-sm">No expense data for this period</p>}
      </div>
    </div>
  );
}