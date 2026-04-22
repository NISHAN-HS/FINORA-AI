import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, TrendingUp, TrendingDown, PiggyBank, Target,
  Bell, BarChart3, Bot, User, Calculator, LogOut, ChevronLeft,
  ChevronRight, ShieldCheck, Wallet, Sun, Moon, Sparkles
} from 'lucide-react';

const navItems = [
  { path: '/',             icon: LayoutDashboard, label: 'Dashboard',      end: true },
  { path: '/expenses',     icon: TrendingDown,    label: 'Expenses' },
  { path: '/income',       icon: TrendingUp,      label: 'Income' },
  { path: '/budget',       icon: Wallet,          label: 'Budget' },
  { path: '/savings',      icon: Target,          label: 'Savings Goals' },
  { path: '/reminders',    icon: Bell,            label: 'Reminders' },
  { path: '/analytics',    icon: BarChart3,       label: 'Analytics' },
  { path: '/chatbot',      icon: Bot,             label: 'AI Assistant' },
  { path: '/calculator',   icon: Calculator,      label: 'Calculator' },
  { path: '/notifications',icon: Bell,            label: 'Notifications' },
  { path: '/profile',      icon: User,            label: 'Profile' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className={`
      relative flex flex-col h-screen bg-white dark:bg-slate-900
      border-r border-slate-100 dark:border-slate-800 sidebar-transition
      ${collapsed ? 'w-[72px]' : 'w-64'}
    `}>
      {/* Logo */}
      <div className={`flex items-center gap-3 p-5 border-b border-slate-100 dark:border-slate-800`}>
        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0 shadow-lg">
          <PiggyBank className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-base">FINORA AI</span>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary-500" />
              <span className="text-xs text-primary-500 font-medium">Smart Money</span>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3.5 top-6 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-slate-500" /> : <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scroll-y p-3 space-y-1">
        {!collapsed && (
          <p className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Menu</p>
        )}
        {navItems.map(({ path, icon: Icon, label, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? label : ''}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
            title={collapsed ? 'Admin' : ''}
          >
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-orange-500" />
            {!collapsed && <span className="text-orange-600 dark:text-orange-400">Admin Panel</span>}
          </NavLink>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={`nav-link w-full ${collapsed ? 'justify-center px-2' : ''}`}
        >
          {darkMode
            ? <Sun className="w-5 h-5 flex-shrink-0 text-yellow-500" />
            : <Moon className="w-5 h-5 flex-shrink-0 text-slate-500" />}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User profile */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`nav-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}