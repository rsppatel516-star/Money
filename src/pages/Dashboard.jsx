import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, IndianRupee, Wallet, TrendingUp, Plus, Target, CalendarSync, PieChart, ReceiptText } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const transactions = useStore(state => state.transactions);
  const subscriptions = useStore(state => state.subscriptions);
  const goals = useStore(state => state.goals);
  const budgets = useStore(state => state.budgets);
  
  // Calculate live metrics
  const { totalBalance, totalIncome, totalExpenses } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach(t => {
      if (t.amount > 0) income += t.amount;
      else expenses += Math.abs(t.amount);
    });
    return {
      totalIncome: income,
      totalExpenses: expenses,
      totalBalance: income - expenses
    };
  }, [transactions]);

  // Generate dynamic chart data based on last 7 days of real transactions
  const chartData = useMemo(() => {
    const dataMap = {};
    
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dataMap[dateStr] = { income: 0, expense: 0, balance: 0 };
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    let cumulativeBalance = 0;
    
    // Sort transactions chronologically
    const sortedTxs = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedTxs.forEach(t => {
      const txDate = new Date(t.date);
      // For cumulative balance, add all past transactions prior to our 7-day window
      if (txDate < sevenDaysAgo) {
        cumulativeBalance += t.amount;
      } else if (dataMap[t.date]) {
        // If it falls within our tracked 7 days map
        if (t.amount > 0) {
          dataMap[t.date].income += t.amount;
        } else {
          dataMap[t.date].expense += Math.abs(t.amount);
        }
      }
    });

    // Generate final array for Recharts
    return Object.keys(dataMap).sort().map(dateStr => {
      const dayData = dataMap[dateStr];
      cumulativeBalance += (dayData.income - dayData.expense);
      
      const d = new Date(dateStr);
      const name = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      return {
        name,
        fullDate: dateStr,
        income: dayData.income,
        expense: dayData.expense,
        balance: cumulativeBalance
      };
    });
  }, [transactions]);

  // Financial Health calculations
  const topGoal = goals && goals.length > 0 ? goals.reduce((prev, current) => (prev.target > current.target) ? prev : current) : null;
  const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  
  // Calculate live monthly spent from transactions
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const totalBudgetSpent = transactions.reduce((acc, t) => {
    if (t.amount < 0) {
      const d = new Date(t.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return acc + Math.abs(t.amount);
      }
    }
    return acc;
  }, 0);

  const budgetProgress = totalBudgetLimit > 0 ? Math.min((totalBudgetSpent / totalBudgetLimit) * 100, 100) : 0;

  // Upcoming subscriptions (next 3)
  const upcomingSubscriptions = [...subscriptions]
    .sort((a, b) => new Date(a.nextBilling) - new Date(b.nextBilling))
    .slice(0, 3);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back! Here's your live financial summary.</p>
        </div>
        
        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/transactions')}>
            <ReceiptText size={16} />
            <span>Add Transaction</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/goals')}>
            <Target size={16} />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      <div className="grid-cards">
        <motion.div variants={itemVariants} className="card">
          <div className="card-header">
            <span className="card-title">Total Balance</span>
            <div className="card-icon"><Wallet size={20} className="text-primary" /></div>
          </div>
          <div className="card-value">₹{totalBalance.toLocaleString()}</div>
          <div className="card-trend trend-up">
            <ArrowUpRight size={16} />
            <span>Live Data Sync</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card">
          <div className="card-header">
            <span className="card-title">Total Income</span>
            <div className="card-icon"><TrendingUp size={20} className="text-success" /></div>
          </div>
          <div className="card-value">₹{totalIncome.toLocaleString()}</div>
          <div className="card-trend trend-up">
            <ArrowUpRight size={16} />
            <span>Based on transactions</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card">
          <div className="card-header">
            <span className="card-title">Total Expenses</span>
            <div className="card-icon"><IndianRupee size={20} className="text-danger" /></div>
          </div>
          <div className="card-value">₹{totalExpenses.toLocaleString()}</div>
          <div className="card-trend trend-down">
            <ArrowDownRight size={16} />
            <span>Based on transactions</span>
          </div>
        </motion.div>
      </div>

      {/* Financial Health Snapshot */}
      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <motion.div variants={itemVariants} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="card-header">
            <span className="card-title">Monthly Budget</span>
            <PieChart size={20} className="text-primary" />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Spent: ₹{totalBudgetSpent.toLocaleString()}</span>
              <span style={{ fontWeight: 600 }}>Limit: ₹{totalBudgetLimit.toLocaleString()}</span>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${budgetProgress > 90 ? 'danger' : budgetProgress > 75 ? 'warning' : 'primary'}`} 
                style={{ width: `${budgetProgress}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="card-header">
            <span className="card-title">Top Savings Goal</span>
            <Target size={20} className="text-success" />
          </div>
          {topGoal ? (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{topGoal.name}</span>
                <span style={{ fontWeight: 600 }}>₹{topGoal.current.toLocaleString()} / ₹{topGoal.target.toLocaleString()}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill success" 
                  style={{ width: `${Math.min((topGoal.current / topGoal.target) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              No active goals. <Link to="/goals" style={{ color: 'var(--primary)' }}>Create one</Link>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        <motion.div variants={itemVariants} className="card">
          <div className="card-header">
            <span className="card-title">Balance Trend (7 Days)</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value > 1000 ? (value/1000).toFixed(1) + 'k' : value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-md)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Balance']}
                />
                <Area type="monotone" dataKey="balance" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card">
          <div className="card-header">
            <span className="card-title">Income vs Expenses</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value > 1000 ? (value/1000).toFixed(1) + 'k' : value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-md)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`]}
                />
                <Bar dataKey="income" fill="var(--success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="var(--danger)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        <motion.div variants={itemVariants} className="card">
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
            <Link to="/transactions" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600 }}>View All</Link>
          </div>
          <div className="list-container">
            {transactions.slice(0, 5).map(item => (
              <div key={item.id} className="list-item">
                <div className="item-left">
                  <div className="item-icon">{item.icon || <ReceiptText size={16} />}</div>
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-category">{item.category}</span>
                  </div>
                </div>
                <div className="item-right">
                  <span className="item-amount" style={{ color: item.amount > 0 ? 'var(--success)' : 'inherit' }}>
                    {item.amount > 0 ? '+' : ''}₹{Math.abs(item.amount).toLocaleString()}
                  </span>
                  <span className="item-date">{item.date}</span>
                </div>
              </div>
            ))}
            {transactions.length === 0 && <p style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>No recent activity.</p>}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card">
          <div className="card-header">
            <span className="card-title">Upcoming Subscriptions</span>
            <Link to="/subscriptions" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600 }}>Manage</Link>
          </div>
          <div className="list-container">
            {upcomingSubscriptions.map(sub => (
              <div key={sub.id} className="list-item">
                <div className="item-left">
                  <div className="item-icon" style={{ backgroundColor: 'var(--panel-bg)' }}>
                    <CalendarSync size={18} className="text-primary" />
                  </div>
                  <div className="item-details">
                    <span className="item-name">{sub.name}</span>
                    <span className="item-category">Due: {sub.nextBilling}</span>
                  </div>
                </div>
                <div className="item-right">
                  <span className="item-amount">₹{sub.amount.toLocaleString()}</span>
                  <span className="item-date" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{sub.cycle}</span>
                </div>
              </div>
            ))}
            {upcomingSubscriptions.length === 0 && <p style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>No upcoming bills.</p>}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

