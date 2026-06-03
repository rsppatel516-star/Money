/* eslint-disable */
import React from 'react';
import { useFinance } from '../context/FinanceContext';
import BudgetCard from '../components/BudgetCard';
import { BiPieChart, BiError, BiBadgeCheck, BiInfoCircle } from 'react-icons/bi';

export default function Budget() {
  const { transactions, budgets, DEFAULT_CATEGORIES, settings } = useFinance();

  const currencySym = settings.currency === 'INR' ? '₹' : settings.currency === 'USD' ? '$' : '€';

  const formatCurrency = (val) => {
    return `${currencySym}${Math.round(val).toLocaleString()}`;
  };

  // Group transactions for current month expenses by category
  const categorySpentMap = React.useMemo(() => {
    const today = new Date();
    const map = {};
    
    // Initialize all default categories with 0 spent
    DEFAULT_CATEGORIES.forEach(c => {
      map[c.name] = 0;
    });

    transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && 
               d.getFullYear() === today.getFullYear() && 
               d.getMonth() === today.getMonth();
      })
      .forEach(tx => {
        map[tx.category] = (map[tx.category] || 0) + Number(tx.amount);
      });

    return map;
  }, [transactions, DEFAULT_CATEGORIES]);

  // Aggregate metrics
  const aggregateMetrics = React.useMemo(() => {
    let totalLimit = 0;
    let totalSpentInBudgets = 0;
    let overspentCount = 0;
    let nearLimitCount = 0;

    Object.keys(budgets).forEach(catName => {
      const limit = budgets[catName] || 0;
      const spent = categorySpentMap[catName] || 0;
      totalLimit += limit;
      totalSpentInBudgets += Math.min(limit, spent); // Track how much of the budget limit we actually consumed
      
      if (limit > 0) {
        if (spent > limit) overspentCount++;
        else if (spent >= limit * 0.8) nearLimitCount++;
      }
    });

    const remaining = Math.max(0, totalLimit - totalSpentInBudgets);

    return {
      totalLimit,
      totalSpent: Object.values(categorySpentMap).reduce((a, b) => a + b, 0),
      remaining,
      overspentCount,
      nearLimitCount
    };
  }, [budgets, categorySpentMap]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-heading tracking-tight leading-none">
          Monthly Budgets
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Establish spending limits per category, track progress, and configure alerts.
        </p>
      </div>

      {/* Aggregate metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Allocation */}
        <div className="p-5 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Budget Limit</span>
          <h4 className="text-xl font-bold text-slate-850 dark:text-slate-205">
            {aggregateMetrics.totalLimit > 0 ? formatCurrency(aggregateMetrics.totalLimit) : 'No Budgets Configured'}
          </h4>
          <span className="text-xs text-slate-400 font-medium">Sum of all active category allocations</span>
        </div>

        {/* Warning Counts */}
        <div className="p-5 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Budget Status</span>
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            {aggregateMetrics.overspentCount > 0 ? (
              <span className="text-rose-500 flex items-center gap-1">
                <BiError /> {aggregateMetrics.overspentCount} Exceeded
              </span>
            ) : aggregateMetrics.nearLimitCount > 0 ? (
              <span className="text-amber-500 flex items-center gap-1">
                <BiInfoCircle /> {aggregateMetrics.nearLimitCount} Warning
              </span>
            ) : (
              <span className="text-emerald-500 flex items-center gap-1">
                <BiBadgeCheck /> All Safe
              </span>
            )}
          </h4>
          <span className="text-xs text-slate-450 font-medium">Current month parameters</span>
        </div>

        {/* Overall Progress */}
        <div className="p-5 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-2 shadow-sm justify-center">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Budget Consumed</span>
            <span className="text-slate-700 dark:text-slate-300">
              {aggregateMetrics.totalLimit > 0 
                ? `${((aggregateMetrics.totalSpent / aggregateMetrics.totalLimit) * 100).toFixed(0)}%` 
                : '0%'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${aggregateMetrics.totalSpent > aggregateMetrics.totalLimit ? 'bg-rose-500' : 'bg-brand-500'}`}
              style={{ width: `${aggregateMetrics.totalLimit > 0 ? Math.min(100, (aggregateMetrics.totalSpent / aggregateMetrics.totalLimit) * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Helper Information Banner */}
      <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/10 border border-slate-200/40 dark:border-slate-800/40 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
        <BiInfoCircle className="text-lg text-brand-500 shrink-0" />
        <span>You can modify your budgets by clicking the edit icon on the cards. Budgets with a limit of 0 or left unconfigured will not trigger spending warnings.</span>
      </div>

      {/* Grid of Budget Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEFAULT_CATEGORIES.map(category => {
          const limit = budgets[category.name] || 0;
          const spent = categorySpentMap[category.name] || 0;

          return (
            <BudgetCard
              key={category.name}
              categoryName={category.name}
              spent={spent}
              limit={limit}
            />
          );
        })}
      </div>
    </div>
  );
}
