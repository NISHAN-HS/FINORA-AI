import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Layout from "./components/Layout";

// Pages
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import Dashboard       from './pages/Dashboard';
import ExpensesPage    from './pages/ExpensesPage';
import IncomePage      from './pages/IncomePage';
import BudgetPage      from './pages/BudgetPage';
import SavingsPage     from './pages/SavingsPage';
import RemindersPage   from './pages/RemindersPage';
import AnalyticsPage   from './pages/AnalyticsPage';
import ChatbotPage     from './pages/ChatbotPage';
import ProfilePage     from './pages/ProfilePage';
import AdminPage       from './pages/AdminPage';
import CalculatorPage  from './pages/CalculatorPage';
import NotificationsPage from './pages/NotificationsPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"/>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading your finances...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index                   element={<Dashboard />} />
        <Route path="expenses"         element={<ExpensesPage />} />
        <Route path="income"           element={<IncomePage />} />
        <Route path="budget"           element={<BudgetPage />} />
        <Route path="savings"          element={<SavingsPage />} />
        <Route path="reminders"        element={<RemindersPage />} />
        <Route path="analytics"        element={<AnalyticsPage />} />
        <Route path="chatbot"          element={<ChatbotPage />} />
        <Route path="profile"          element={<ProfilePage />} />
        <Route path="calculator"       element={<CalculatorPage />} />
        <Route path="notifications"    element={<NotificationsPage />} />
        <Route path="admin"            element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}