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
  BiTrash, 
  BiEditAlt,
  BiImage,
  BiX
} from 'react-icons/bi';

export default function TransactionCard({ transaction, onEdit }) {
  const { deleteTransaction, DEFAULT_CATEGORIES, settings } = useFinance();
  const [showReceipt, setShowReceipt] = useState(false);

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

  const cat = getCategoryDetails(transaction.category);
  const isExpense = transaction.type === 'expense';

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-900/50 transition-all duration-200 group">
        <div className="flex items-center gap-4 overflow-hidden">
          {/* Category Icon */}
          <div className={`w-11 h-11 rounded-xl ${cat.bg} flex items-center justify-center shrink-0`}>
            {getCategoryIcon(cat.icon)}
          </div>

          {/* Details */}
          <div className="overflow-hidden">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
              {transaction.note || transaction.category}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded">
                {transaction.category}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {transaction.date}
              </span>
            </div>
          </div>
        </div>

        {/* Amount & Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className={`font-bold text-sm ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>
              {isExpense ? '-' : '+'} {formatCurrency(transaction.amount)}
            </span>
          </div>

          {/* Action buttons shown on hover on desktop, always visible on mobile */}
          <div className="flex items-center gap-1.5 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {transaction.receipt && (
              <button
                onClick={() => setShowReceipt(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                title="View Receipt"
              >
                <BiImage className="text-lg" />
              </button>
            )}
            <button
              onClick={() => onEdit(transaction)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              title="Edit"
            >
              <BiEditAlt className="text-lg" />
            </button>
            <button
              onClick={() => deleteTransaction(transaction.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              title="Delete"
            >
              <BiTrash className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox for Receipt */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowReceipt(false)} />
          <div className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-2 shadow-2xl z-10 animate-scaleUp">
            <button
              onClick={() => setShowReceipt(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/60 text-white hover:bg-slate-950 transition-colors z-20"
            >
              <BiX className="text-xl" />
            </button>
            <img
              src={transaction.receipt}
              alt="Transaction Receipt"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <div className="p-4 bg-slate-900 text-white">
              <h4 className="font-bold text-sm">{transaction.note || transaction.category}</h4>
              <p className="text-xs text-slate-400 mt-1">Uploaded file: {transaction.receiptName || 'Receipt image'}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
