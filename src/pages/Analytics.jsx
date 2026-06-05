import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const PIE_COLORS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#06b6d4', '#ef4444', '#10b981'];

export default function Analytics() {
  const transactions = useStore(state => state.transactions);

  // Dynamic data computation based on real transactions
  const { monthlyData, categoryData, totalCategoryExp, dailyData, topCategoryName, topCategoryValue, avgDailyExpense } = useMemo(() => {
    // 1. Monthly Data (last 6 months)
    const monthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mStr = d.toLocaleString('default', { month: 'short' });
      monthMap[mStr] = { name: mStr, expense: 0, income: 0, sortKey: d.getFullYear() * 100 + d.getMonth() };
    }

    // 2. Category Data (All time expenses)
    const catMap = {};
    let totalExp = 0;

    // 3. Daily Data (Last 30 days)
    const dayMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      dayMap[dStr] = { day: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`, value: 0 };
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    transactions.forEach(t => {
      const amt = Math.abs(t.amount);
      const txDate = new Date(t.date);
      const mStr = txDate.toLocaleString('default', { month: 'short' });

      // Monthly
      if (monthMap[mStr]) {
        if (t.amount > 0) monthMap[mStr].income += amt;
        else monthMap[mStr].expense += amt;
      }

      // Category
      if (t.amount < 0) {
        catMap[t.category] = (catMap[t.category] || 0) + amt;
        totalExp += amt;
      }

      // Daily
      if (t.amount < 0 && txDate >= thirtyDaysAgo && dayMap[t.date]) {
        dayMap[t.date].value += amt;
      }
    });

    const mData = Object.values(monthMap).sort((a, b) => a.sortKey - b.sortKey);

    const cData = Object.entries(catMap).map(([name, value]) => ({
      name,
      value,
      percent: totalExp > 0 ? Math.round((value / totalExp) * 100) : 0
    })).sort((a, b) => b.value - a.value);

    const dData = Object.values(dayMap);

    const topCat = cData.length > 0 ? cData[0] : { name: 'None', value: 0 };
    const avgDaily = totalExp > 0 ? Math.round(totalExp / 30) : 0; // Simplified average

    return {
      monthlyData: mData,
      categoryData: cData,
      totalCategoryExp: totalExp,
      dailyData: dData,
      topCategoryName: topCat.name,
      topCategoryValue: topCat.value,
      avgDailyExpense: avgDaily
    };
  }, [transactions]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '800px' }}>
          Deep-dive analysis of categories share, monthly indices, and daily run-rate trends.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        
        <motion.div variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Top Spending Category</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>{topCategoryName}</h3>
          <p style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 500 }}>₹{topCategoryValue.toLocaleString()} total spent</p>
        </motion.div>

        <motion.div variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Average Daily Expense</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>₹{avgDailyExpense.toLocaleString()}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Based on 30-day projection</p>
        </motion.div>

        <motion.div variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Savings Growth Rate</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            +15.2% <span style={{ color: '#10b981', fontSize: '1.2rem' }}>↑</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Compared to last quarter benchmark</p>
        </motion.div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        
        {/* Monthly Spend Comparison */}
        <motion.div variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 Monthly Spend Comparison
          </h4>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={true} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={true} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div> Expenses
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></div> Income
            </div>
          </div>
        </motion.div>

        {/* Category Breakdown Share */}
        <motion.div variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🥧 Category Breakdown Share
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', height: '300px' }}>
            <div style={{ flex: 1, position: 'relative', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>TOTAL EXP</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>₹{totalCategoryExp.toLocaleString()}</p>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1rem', overflowY: 'auto' }}>
              {categoryData.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No expense data available.</p>
              ) : (
                categoryData.map((item, idx) => (
                  <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f3f4f6', padding: '0.5rem 0.75rem', borderRadius: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>₹{item.value.toLocaleString()} ({item.percent}%)</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

      </div>

      {/* Daily Spending Trends */}
      <motion.div variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📈 Daily Spending Trends (Current Month)
        </h4>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="day" axisLine={true} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} interval={1} />
              <YAxis axisLine={true} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" activeDot={{ r: 6, fill: '#8b5cf6', stroke: 'white', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </motion.div>
  );
}
