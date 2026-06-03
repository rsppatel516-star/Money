/* eslint-disable */
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { BiSun, BiBell, BiLogOut } from 'react-icons/bi';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { insights } = useFinance();
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Get Page Title from Route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/transactions') return 'Transactions';
    if (path === '/analytics') return 'Analytics & Trends';
    if (path === '/budget') return 'Budget Planner';
    if (path === '/goals') return 'Savings Goals';
    if (path === '/subscriptions') return 'Recurring Subscriptions';
    if (path === '/debts') return 'Debt Repayments';
    if (path === '/insights') return 'AI Financial Insights';
    if (path === '/settings') return 'Settings';
    return 'MoneyFlow';
  };

  const alertInsights = insights.filter(i => i.type === 'warning');

  return (
    <header className="h-20 px-6 border-b border-slate-200/50 dark:border-slate-800/50 glass-panel-light dark:glass-panel-dark flex items-center justify-between sticky top-0 z-30">
      {/* Page Title / Brand on Mobile */}
      <div className="flex items-center gap-3">
        {/* Mobile Logo */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center shadow-lg md:hidden">
          <span className="text-white text-sm font-bold">M</span>
        </div>
        <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-slate-100">
          <span className="md:inline hidden">{getPageTitle()}</span>
          <span className="inline md:hidden text-brand-600 dark:text-brand-400">MoneyFlow</span>
        </h2>
      </div>

      {/* Utilities */}
      <div className="flex items-center gap-4">
        {/* Alerts / Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationDropdown(!showNotificationDropdown);
            }}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors relative"
          >
            <BiBell className="text-xl" />
            {alertInsights.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {showNotificationDropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 p-4 shadow-xl z-50">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
                <span>Alerts & Notifications</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">
                  {alertInsights.length} critical
                </span>
              </h4>
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {alertInsights.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center">
                    All clear! No alerts at this time.
                  </p>
                ) : (
                  alertInsights.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10 flex flex-col gap-1"
                    >
                      <h5 className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        {alert.title}
                      </h5>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                        {alert.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Status Indicator */}
        <div className="p-2.5 rounded-xl text-amber-500 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center" title="Light Mode Enabled">
          <BiSun className="text-xl animate-spin-slow" />
        </div>

        {/* Mobile Quick Logout */}
        <button
          onClick={logout}
          className="p-2.5 rounded-xl text-slate-600 hover:text-rose-500 dark:text-slate-400 hover:bg-rose-500/10 md:hidden transition-colors"
          title="Sign Out"
        >
          <BiLogOut className="text-xl" />
        </button>
      </div>
    </header>
  );
}
