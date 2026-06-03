/* eslint-disable */
import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import TransactionCard from '../components/TransactionCard';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { 
  BiTrendingUp, 
  BiTrendingDown, 
  BiWallet, 
  BiDollarCircle, 
  BiCreditCard, 
  BiTargetLock, 
  BiChevronRight,
  BiBrain
} from 'react-icons/bi';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { 
    transactions, 
    income, 
    expenses, 
    balance, 
    budgets, 
    goals, 
    insights, 
    settings,
    DEFAULT_CATEGORIES 
  } = useFinance();

  // Animated counters
  const animatedBalance = useAnimatedCounter(balance);
  const animatedIncome = useAnimatedCounter(income);
  const animatedExpenses = useAnimatedCounter(expenses);

  const currencySym = settings.currency === 'INR' ? '₹' : settings.currency === 'USD' ? '$' : '€';

  const formatCurrency = (val) => {
    return `${currencySym}${Math.round(val).toLocaleString()}`;
  };

  // Get active savings rate
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const animatedSavingsRate = useAnimatedCounter(savingsRate > 0 ? savingsRate : 0);

  // Compute category spending for the Pie Chart
  const categorySpendingData = React.useMemo(() => {
    const dataMap = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(tx => {
        dataMap[tx.category] = (dataMap[tx.category] || 0) + Number(tx.amount);
      });

    return Object.keys(dataMap).map(catName => {
      const catConfig = DEFAULT_CATEGORIES.find(c => c.name === catName) || { color: '#94a3b8' };
      return {
        name: catName,
        value: dataMap[catName],
        color: catConfig.color
      };
    });
  }, [transactions]);

  // Recent transactions (last 4 items)
  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-heading tracking-tight leading-none">
            Financial Overview
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Real-time track of your incomes, expenses, budgets and savings.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-semibold bg-slate dark:bg-slate-800/20 px-3 py-1.5 rounded-lg border border-slate-200/20 dark:border-slate-800/20">
          Last sync: Just now
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Balance Card */}
        <div className="p-5 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-3 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Balance</span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-1000 flex items-center justify-center">
              <BiWallet className="text-lg" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-heading">
              {formatCurrency(animatedBalance)}
            </h3>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
              <BiTrendingUp /> +14.8% from last month
            </span>
          </div>
        </div>

        {/* Monthly Income Card */}
        <div className="p-5 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-3 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monthly Income</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <BiDollarCircle className="text-lg" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-heading">
              {formatCurrency(animatedIncome)}
            </h3>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
              <BiTrendingUp /> +12.3% income growth
            </span>
          </div>
        </div>

        {/* Monthly Expenses Card */}
        <div className="p-5 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-3 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monthly Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <BiCreditCard className="text-lg" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-heading">
              {formatCurrency(animatedExpenses)}
            </h3>
            <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-1">
              <BiTrendingDown /> -3.5% less spending
            </span>
          </div>
        </div>

        {/* Savings Overview Card */}
        <div className="p-5 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-3 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Savings Rate</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <BiTargetLock className="text-lg" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-heading">
              {animatedSavingsRate.toFixed(0)}%
            </h3>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mt-2.5 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-300"
                style={{ width: `${savingsRate > 0 ? Math.min(100, savingsRate) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      {insights.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-brand-600/15 via-violet-600/10 to-transparent border border-brand-500/20 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <BiBrain className="text-xl animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              AI Spending Insights
            </h4>
            <div className="space-y-1 mt-1.5">
              {insights.slice(0, 2).map((ins) => (
                <p key={ins.id} className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  💡 <span className="font-semibold text-slate-700 dark:text-slate-300">{ins.title}:</span> {ins.message}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Transactions & Budget progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Transactions */}
          <div className="p-6 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-heading">
                Recent Transactions
              </h3>
              <Link
                to="/transactions"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center hover:underline"
              >
                View All <BiChevronRight className="text-lg" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  No transactions yet. Click the + button in the bottom right to add one!
                </div>
              ) : (
                recentTransactions.map((tx) => (
                  <TransactionCard key={tx.id} transaction={tx} />
                ))
              )}
            </div>
          </div>

          {/* Budget Quick-Overview */}
          <div className="p-6 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-heading">
              Budget Spending Limits
            </h3>
            
            {Object.keys(budgets).length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                No active budgets. Navigate to the{' '}
                <Link to="/budget" className="text-brand-600 dark:text-brand-400 font-semibold underline">
                  Budget Planner
                </Link>{' '}
                to create limits.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(budgets).slice(0, 4).map((catName) => {
                  const limit = budgets[catName];
                  const spent = transactions
                    .filter(t => t.type === 'expense' && t.category === catName)
                    .reduce((acc, t) => acc + Number(t.amount), 0);
                  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
                  
                  return (
                    <div key={catName} className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/20 border border-slate-200/40 dark:border-slate-800/40 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{catName}</span>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          {formatCurrency(spent)} of {formatCurrency(limit)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${percentage >= 100 ? 'bg-rose-500' : percentage >= 80 ? 'bg-amber-500' : 'bg-brand-500'}`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Savings Goals & Category breakdown charts */}
        <div className="space-y-6">
          {/* Category Breakdown (Pie chart) */}
          <div className="p-6 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-heading mb-4">
              Spending Breakdown
            </h3>

            {categorySpendingData.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                Add expenses to visualize breakdown charts.
              </div>
            ) : (
              <div className="h-44 w-full flex items-center justify-center relative">
                <div className="w-[99%] h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySpendingData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categorySpendingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Center text overlay */}
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total spent</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                    {formatCurrency(expenses)}
                  </span>
                </div>
              </div>
            )}

            {/* Custom Pie Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4 max-h-24 overflow-y-auto pr-1">
              {categorySpendingData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 overflow-hidden">
                  <div className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                    {item.name} ({((item.value / expenses) * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Savings Goals */}
          <div className="p-6 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-heading">
                Savings Goals
              </h3>
              <Link
                to="/goals"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center hover:underline"
              >
                Manage <BiChevronRight className="text-lg" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {goals.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  No goals set. Create goals for laptops, bikes or vacations in Goals tab.
                </div>
              ) : (
                goals.slice(0, 3).map((goal) => {
                  const percentage = goal.target > 0 ? (goal.saved / goal.target) * 100 : 0;
                  return (
                    <div key={goal.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{goal.name}</span>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          {formatCurrency(goal.saved)} / {formatCurrency(goal.target)}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold text-right">
                        {percentage.toFixed(0)}% reached
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
