import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
  '/':              'Dashboard',
  '/expenses':      'Expenses',
  '/income':        'Income',
  '/budget':        'Budget Planner',
  '/savings':       'Savings Goals',
  '/reminders':     'Bill Reminders',
  '/analytics':     'Analytics',
  '/chatbot':       'AI Assistant',
  '/calculator':    'EMI Calculator',
  '/notifications': 'Notifications',
  '/profile':       'Profile',
  '/admin':         'Admin Panel',
};

export default function Layout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Finance App';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto scroll-y p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}