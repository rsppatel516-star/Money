/* eslint-disable */
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  BiFoodMenu, 
  BiCompass, 
  BiShoppingBag, 
  BiTv, 
  BiBookOpen, 
  BiPlusMedical, 
  BiReceipt, 
  BiTrendingUp, 
  BiQuestionMark,
  BiEditAlt,
  BiCheck
} from 'react-icons/bi';

export default function BudgetCard({ categoryName, spent, limit }) {
  const { setBudget, DEFAULT_CATEGORIES, settings } = useFinance();
  const [isEditing, setIsEditing] = useState(false);
  const [newLimit, setNewLimit] = useState(limit || '');

  const getCategoryDetails = (catName) => {
    return DEFAULT_CATEGORIES.find(c => c.name === catName) || {
      name: 'Other',
      color: '#94a3b8',
      icon: 'BiQuestionMark',
      bg: 'bg-slate-500/10 text-slate-500'
    };
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'BiFoodMenu': return <BiFoodMenu className="text-lg" />;
      case 'BiCompass': return <BiCompass className="text-lg" />;
      case 'BiShoppingBag': return <BiShoppingBag className="text-lg" />;
      case 'BiTv': return <BiTv className="text-lg" />;
      case 'BiBookOpen': return <BiBookOpen className="text-lg" />;
      case 'BiPlusMedical': return <BiPlusMedical className="text-lg" />;
      case 'BiReceipt': return <BiReceipt className="text-lg" />;
      case 'BiTrendingUp': return <BiTrendingUp className="text-lg" />;
      default: return <BiQuestionMark className="text-lg" />;
    }
  };

  const formatCurrency = (val) => {
    const sym = settings.currency === 'INR' ? '₹' : settings.currency === 'USD' ? '$' : '€';
    return `${sym}${Number(val).toLocaleString()}`;
  };

  const cat = getCategoryDetails(categoryName);
  const percentage = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  const remaining = limit > 0 ? Math.max(0, limit - spent) : 0;
  
  // Status Colors
  const isOver = spent > limit && limit > 0;
  const isWarn = spent >= limit * 0.8 && spent <= limit && limit > 0;
  
  let progressColor = 'bg-brand-500';
  if (isOver) progressColor = 'bg-rose-500';
  else if (isWarn) progressColor = 'bg-amber-500';

  const handleSaveBudget = async () => {
    if (newLimit === '' || Number(newLimit) < 0) return;
    await setBudget(categoryName, Number(newLimit));
    setIsEditing(false);
  };

  return (
    <div className="p-5 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Decorative Gradient Line for high alerts */}
      {isOver && <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 animate-pulse" />}
      {isWarn && <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center`}>
            {getCategoryIcon(cat.icon)}
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {categoryName}
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Budget Category
            </p>
          </div>
        </div>

        {/* Editing Trigger */}
        <div>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                placeholder="Limit"
                className="w-20 px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                min="0"
                autoFocus
              />
              <button
                onClick={handleSaveBudget}
                className="p-1 rounded bg-brand-500 text-white hover:bg-brand-600 transition-colors"
              >
                <BiCheck className="text-sm" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
            >
              <BiEditAlt className="text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Figures */}
      <div className="flex items-baseline justify-between mt-1">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Spent:</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 ml-1">
            {formatCurrency(spent)}
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Budget:</span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 ml-1">
            {limit > 0 ? formatCurrency(limit) : 'Not Set'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {limit > 0 ? (
        <div className="space-y-1.5">
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800/60 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-semibold">
            <span className={`${isOver ? 'text-rose-500' : isWarn ? 'text-amber-500' : 'text-slate-400'}`}>
              {percentage.toFixed(0)}% Used
            </span>
            <span className="text-slate-400 dark:text-slate-500">
              {isOver ? 'Limit Exceeded' : `${formatCurrency(remaining)} remaining`}
            </span>
          </div>
        </div>
      ) : (
        <div className="py-2.5 text-center bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
          >
            Set Spending Limit
          </button>
        </div>
      )}
    </div>
  );
}
