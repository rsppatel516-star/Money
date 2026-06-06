import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Subscriptions from './pages/Subscriptions';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';
import Goals from './pages/Goals';
import Debts from './pages/Debts';
import Insights from './pages/Insights';
import Calculator from './pages/Calculator';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Reports from './pages/Reports';
import SIP from './pages/SIP';
import { useStore } from './store/useStore';

const ProtectedRoute = () => {
  const user = useStore(state => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="goals" element={<Goals />} />
            <Route path="debts" element={<Debts />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="insights" element={<Insights />} />
            <Route path="calculator" element={<Calculator />} />
            <Route path="reports" element={<Reports />} />
            <Route path="sip" element={<SIP />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
