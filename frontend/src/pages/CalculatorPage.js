import React, { useState } from 'react';
import { Calculator, TrendingDown, Info } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function CalculatorPage() {
  const [loan, setLoan]   = useState({ principal: '', rate: '', tenure: '', type: 'months' });
  const [result, setResult] = useState(null);
  const [fdForm, setFdForm] = useState({ principal: '', rate: '', years: '' });
  const [fdResult, setFdResult] = useState(null);
  const [tab, setTab] = useState('emi');

  const calcEMI = () => {
    const P = parseFloat(loan.principal);
    const r = parseFloat(loan.rate) / 100 / 12;
    const n = loan.type === 'years' ? parseFloat(loan.tenure) * 12 : parseFloat(loan.tenure);
    if (!P || !r || !n) return;
    const emi  = (P * r * Math.pow(1+r, n)) / (Math.pow(1+r, n) - 1);
    const total = emi * n;
    const interest = total - P;
    setResult({ emi: emi.toFixed(2), total: total.toFixed(2), interest: interest.toFixed(2), principal: P, months: n });
  };

  const calcFD = () => {
    const P = parseFloat(fdForm.principal);
    const r = parseFloat(fdForm.rate) / 100;
    const t = parseFloat(fdForm.years);
    if (!P || !r || !t) return;
    const maturity = P * Math.pow(1 + r/4, 4*t);
    const interest  = maturity - P;
    setFdResult({ maturity: maturity.toFixed(2), interest: interest.toFixed(2), principal: P });
  };

  const TABS = [
    { id: 'emi', label: '📊 EMI Calculator' },
    { id: 'fd',  label: '🏦 FD Calculator' },
    { id: 'tips',label: '💡 Finance Tips' },
  ];

  const tips = [
    { icon:'💳', title:'50/30/20 Rule', desc:'Spend 50% on needs, 30% on wants, and save 20% of your income every month.' },
    { icon:'📈', title:'Start SIP Early', desc:'Invest in SIP (Systematic Investment Plan) early. ₹1000/month at 12% returns = ₹50L in 30 years.' },
    { icon:'🏦', title:'Emergency Fund', desc:'Maintain 3–6 months of expenses as emergency fund in a liquid account.' },
    { icon:'💰', title:'Reduce Debt First', desc:'Pay off high-interest debts (credit cards 36%+) before investing.' },
    { icon:'📋', title:'Credit Score', desc:'Maintain a credit score above 750 to get lower interest rates on loans.' },
    { icon:'🎯', title:'Goal-Based Saving', desc:'Define specific goals — vacation, home, education — and save separately for each.' },
    { icon:'⚡', title:'Automate Savings', desc:'Set up auto-debit on salary day. Pay yourself first before spending.' },
    { icon:'📊', title:'Track Net Worth', desc:'Calculate your net worth monthly: Assets - Liabilities. Aim for consistent growth.' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="section-title">Finance Calculators</h2>
        <p className="section-subtitle">Plan your loans, investments and finances</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* EMI Calculator */}
      {tab === 'emi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary-500"/> EMI Calculator
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">Loan Amount (₹) *</label>
                <input type="number" value={loan.principal}
                  onChange={e => setLoan({...loan, principal:e.target.value})}
                  placeholder="e.g. 500000" className="input"/>
              </div>
              <div>
                <label className="label">Annual Interest Rate (%) *</label>
                <input type="number" step="0.1" value={loan.rate}
                  onChange={e => setLoan({...loan, rate:e.target.value})}
                  placeholder="e.g. 8.5" className="input"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tenure *</label>
                  <input type="number" value={loan.tenure}
                    onChange={e => setLoan({...loan, tenure:e.target.value})}
                    placeholder="e.g. 5" className="input"/>
                </div>
                <div>
                  <label className="label">Unit</label>
                  <select value={loan.type} onChange={e => setLoan({...loan, type:e.target.value})} className="select">
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
              <button onClick={calcEMI} className="btn-primary w-full py-3">
                <Calculator className="w-4 h-4"/> Calculate EMI
              </button>
            </div>
          </div>

          {/* EMI Result */}
          <div className="card p-6">
            {result ? (
              <>
                <h3 className="font-bold text-slate-800 dark:text-white mb-5">EMI Breakdown</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
                    <p className="text-xs text-blue-500 font-medium mb-1">Monthly EMI</p>
                    <p className="text-2xl font-bold text-blue-600">₹{parseFloat(result.emi).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
                    <p className="text-xs text-red-500 font-medium mb-1">Total Interest</p>
                    <p className="text-2xl font-bold text-red-500">₹{parseFloat(result.interest).toLocaleString('en-IN', {maximumFractionDigits:0})}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-center col-span-2">
                    <p className="text-xs text-slate-500 font-medium mb-1">Total Payment</p>
                    <p className="text-2xl font-bold text-slate-700 dark:text-white">₹{parseFloat(result.total).toLocaleString('en-IN', {maximumFractionDigits:0})}</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={[
                      { name:'Principal', value: result.principal },
                      { name:'Interest',  value: parseFloat(result.interest) }
                    ]} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value">
                      <Cell fill="#3b82f6"/>
                      <Cell fill="#ef4444"/>
                    </Pie>
                    <Tooltip formatter={v => `₹${parseFloat(v).toLocaleString('en-IN', {maximumFractionDigits:0})}`}/>
                    <Legend wrapperStyle={{fontSize:'12px'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <TrendingDown className="w-16 h-16 mb-4 opacity-20"/>
                <p className="text-sm text-center">Fill in the loan details and<br/>click Calculate to see your EMI</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FD Calculator */}
      {tab === 'fd' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
              🏦 Fixed Deposit Calculator
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">Principal Amount (₹) *</label>
                <input type="number" value={fdForm.principal} onChange={e => setFdForm({...fdForm,principal:e.target.value})} placeholder="e.g. 100000" className="input"/>
              </div>
              <div>
                <label className="label">Annual Interest Rate (%) *</label>
                <input type="number" step="0.1" value={fdForm.rate} onChange={e => setFdForm({...fdForm,rate:e.target.value})} placeholder="e.g. 7.1" className="input"/>
              </div>
              <div>
                <label className="label">Tenure (Years) *</label>
                <input type="number" step="0.5" value={fdForm.years} onChange={e => setFdForm({...fdForm,years:e.target.value})} placeholder="e.g. 2" className="input"/>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Info className="w-3 h-3"/> Interest compounded quarterly (standard bank method)
                </p>
              </div>
              <button onClick={calcFD} className="btn-primary w-full py-3">Calculate Maturity</button>
            </div>
          </div>

          <div className="card p-6">
            {fdResult ? (
              <>
                <h3 className="font-bold text-slate-800 dark:text-white mb-5">FD Maturity Details</h3>
                <div className="space-y-4">
                  <div className="p-5 rounded-xl bg-green-50 dark:bg-green-900/20 text-center">
                    <p className="text-xs text-green-600 font-medium mb-1">Maturity Amount</p>
                    <p className="text-3xl font-bold text-green-600">₹{parseFloat(fdResult.maturity).toLocaleString('en-IN', {maximumFractionDigits:0})}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-center">
                      <p className="text-xs text-slate-500 mb-1">Principal</p>
                      <p className="text-lg font-bold text-slate-700 dark:text-white">₹{parseFloat(fdResult.principal).toLocaleString('en-IN', {maximumFractionDigits:0})}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
                      <p className="text-xs text-blue-500 mb-1">Interest Earned</p>
                      <p className="text-lg font-bold text-blue-600">₹{parseFloat(fdResult.interest).toLocaleString('en-IN', {maximumFractionDigits:0})}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                <span className="text-5xl mb-4 opacity-30">🏦</span>
                <p className="text-sm text-center">Enter FD details to calculate<br/>your maturity amount</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Finance Tips */}
      {tab === 'tips' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tips.map((tip, i) => (
            <div key={i} className="card-hover p-5">
              <div className="text-3xl mb-3">{tip.icon}</div>
              <h4 className="font-bold text-slate-800 dark:text-white mb-2 text-sm">{tip.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}