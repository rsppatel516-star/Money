/* eslint-disable */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BiGridAlt, 
  BiTransfer, 
  BiReceipt, 
  BiCoin,
  BiChip 
} from 'react-icons/bi';

const navigation = [
  { name: 'Home', to: '/', icon: BiGridAlt },
  { name: 'History', to: '/transactions', icon: BiTransfer },
  { name: 'Subs', to: '/subscriptions', icon: BiReceipt },
  { name: 'Debts', to: '/debts', icon: BiCoin },
  { name: 'Insights', to: '/insights', icon: BiChip },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 md:hidden glass-panel-light dark:glass-panel-dark border-t border-slate-200/50 dark:border-slate-805/50 flex items-center justify-around px-2 pb-safe z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-all duration-150 ${
              isActive
                ? 'text-brand-600 dark:text-brand-400 scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`
          }
        >
          <item.icon className="text-xl mb-0.5" />
          <span>{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
}
