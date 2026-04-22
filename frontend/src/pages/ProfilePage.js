// ProfilePage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Globe, DollarSign, Save } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

export function ProfilePage() {
  const { user, loadUser } = useAuth();
  const [form, setForm]     = useState({ name: user?.name||'', currency: user?.currency||'INR', language: user?.language||'en' });
  const [pass, setPass]     = useState({ oldPassword:'', newPassword:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const saveProfile = async e => {
    e.preventDefault(); setSaving(true);
    try { await API.put('/auth/profile', form); await loadUser(); toast.success('Profile updated!'); }
    catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const changePass = async e => {
    e.preventDefault();
    if (pass.newPassword !== pass.confirm) return toast.error('Passwords do not match');
    if (pass.newPassword.length < 6) return toast.error('Min 6 characters');
    setSavingPass(true);
    try { await API.put('/auth/change-password', { oldPassword: pass.oldPassword, newPassword: pass.newPassword }); toast.success('Password changed!'); setPass({ oldPassword:'', newPassword:'', confirm:'' }); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingPass(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div><h2 className="section-title">Profile Settings</h2><p className="section-subtitle">Manage your account information</p></div>

      {/* Avatar */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {user?.name?.[0]?.toUpperCase()||'U'}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">{user?.name}</h3>
          <p className="text-slate-400">{user?.email}</p>
          <span className={`badge mt-1 ${user?.role === 'admin' ? 'badge-red' : 'badge-blue'}`}>{user?.role}</span>
        </div>
      </div>

      {/* Profile form */}
      <div className="card p-6">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><User className="w-5 h-5 text-primary-500"/>Personal Info</h3>
        <form onSubmit={saveProfile} className="space-y-4">
          <div><label className="label">Full Name</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} className="input"/></div>
          <div><label className="label">Email</label><input value={user?.email} disabled className="input opacity-60 cursor-not-allowed"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Currency</label>
              <select value={form.currency} onChange={e => setForm({...form,currency:e.target.value})} className="select">
                <option value="INR">₹ INR</option><option value="USD">$ USD</option><option value="EUR">€ EUR</option><option value="GBP">£ GBP</option>
              </select>
            </div>
            <div><label className="label">Language</label>
              <select value={form.language} onChange={e => setForm({...form,language:e.target.value})} className="select">
                <option value="en">English</option><option value="hi">Hindi</option><option value="ta">Tamil</option><option value="te">Telugu</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary"><Save className="w-4 h-4"/>{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-primary-500"/>Change Password</h3>
        <form onSubmit={changePass} className="space-y-4">
          <div><label className="label">Current Password</label><input type="password" value={pass.oldPassword} onChange={e => setPass({...pass,oldPassword:e.target.value})} className="input" required /></div>
          <div><label className="label">New Password</label><input type="password" value={pass.newPassword} onChange={e => setPass({...pass,newPassword:e.target.value})} className="input" required /></div>
          <div><label className="label">Confirm New Password</label><input type="password" value={pass.confirm} onChange={e => setPass({...pass,confirm:e.target.value})} className="input" required /></div>
          <button type="submit" disabled={savingPass} className="btn-primary"><Lock className="w-4 h-4"/>{savingPass ? 'Updating...' : 'Update Password'}</button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;