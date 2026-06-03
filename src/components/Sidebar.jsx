/* eslint-disable */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BiGridAlt, 
  BiTransfer, 
  BiPieChartAlt2, 
  BiCalculator, 
  BiTargetLock, 
  BiCog, 
  BiLogOut,
  BiReceipt,
  BiCoin,
  BiChip
} from 'react-icons/bi';

const navigation = [
  { name: 'Dashboard', to: '/', icon: BiGridAlt },
  { name: 'Transactions', to: '/transactions', icon: BiTransfer },
  { name: 'Analytics', to: '/analytics', icon: BiPieChartAlt2 },
  { name: 'Budgets', to: '/budget', icon: BiCalculator },
  { name: 'Savings Goals', to: '/goals', icon: BiTargetLock },
  { name: 'Subscriptions', to: '/subscriptions', icon: BiReceipt },
  { name: 'Debt Manager', to: '/debts', icon: BiCoin },
  { name: 'AI Insights Coach', to: '/insights', icon: BiChip },
  { name: 'Settings', to: '/settings', icon: BiCog },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen hidden md:flex flex-col border-r border-slate-200/50 dark:border-slate-800/50 glass-panel-light dark:glass-panel-dark sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <span className="text-white text-xl font-bold font-heading">M</span>
        </div>
        <div>
          <h1 className="text-xl font-extrabold font-heading bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent leading-none">
            MoneyFlow
          </h1>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
            Smart Tracker
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-brand-500/10 to-violet-500/10 text-brand-600 dark:text-brand-400 border-l-4 border-brand-500 pl-3'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="text-xl group-hover:scale-110 transition-transform" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-100/30 dark:bg-slate-950/20">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName}`}
              alt={user?.displayName || 'User'}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500/20"
            />
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                {user?.displayName || 'Guest User'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 dark:text-slate-400 transition-colors"
            title="Sign Out"
          >
            <BiLogOut className="text-lg" />
          </button>
        </div>
      </div>
    </aside>
  );
}
