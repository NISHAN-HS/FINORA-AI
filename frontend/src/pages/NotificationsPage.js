// NotificationsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  budget_alert: 'border-red-400 bg-red-50 dark:bg-red-900/20',
  fraud_alert:  'border-orange-400 bg-orange-50 dark:bg-orange-900/20',
  bill_reminder:'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  ai_suggestion:'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
  general:      'border-slate-200 bg-white dark:bg-slate-800',
};
const TYPE_ICONS = { budget_alert:'🚨', fraud_alert:'⚠️', bill_reminder:'🔔', ai_suggestion:'🤖', general:'📢' };

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markAllRead = async () => {
    try { await API.put('/notifications/read-all'); fetchData(); toast.success('All marked as read'); }
    catch { toast.error('Failed'); }
  };

  const del = async id => {
    try { await API.delete(`/notifications/${id}`); fetchData(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between">
        <div><h2 className="section-title">Notifications</h2><p className="section-subtitle">{unread} unread</p></div>
        {unread > 0 && <button onClick={markAllRead} className="btn-secondary text-sm"><CheckCheck className="w-4 h-4"/>Mark all read</button>}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"/></div>
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-slate-700"/>
          <p className="text-slate-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className={`card border-l-4 p-4 flex gap-3 ${TYPE_COLORS[n.type]||TYPE_COLORS.general} ${!n.is_read ? 'ring-1 ring-primary-200 dark:ring-primary-800' : ''}`}>
              <span className="text-xl flex-shrink-0">{TYPE_ICONS[n.type]||'📢'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-semibold text-sm ${!n.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{n.title}</p>
                  {!n.is_read && <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5"/>}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => del(n.id)} className="btn-icon text-red-400 flex-shrink-0"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;