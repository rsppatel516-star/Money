/* eslint-disable */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';
import SavingsGoals from './pages/SavingsGoals';
import Subscriptions from './pages/Subscriptions';
import Debts from './pages/Debts';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import { motion } from 'framer-motion';

// Page Animation wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

// Route Guard that protects dashboards and applies the Layout
const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/transactions" element={<PageWrapper><Transactions /></PageWrapper>} />
        <Route path="/analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
        <Route path="/budget" element={<PageWrapper><Budget /></PageWrapper>} />
        <Route path="/goals" element={<PageWrapper><SavingsGoals /></PageWrapper>} />
        <Route path="/subscriptions" element={<PageWrapper><Subscriptions /></PageWrapper>} />
        <Route path="/debts" element={<PageWrapper><Debts /></PageWrapper>} />
        <Route path="/insights" element={<PageWrapper><Insights /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

// Route Guard that redirects logged-in users away from the login page
const AuthRoute = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Auth />;
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <FinanceProvider>
            <Routes>
              {/* Authentication view */}
              <Route path="/auth" element={<AuthRoute />} />
              
              {/* Workspace views wrapped inside layouts */}
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </FinanceProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
