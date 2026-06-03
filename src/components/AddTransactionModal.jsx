/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { BiX, BiUpload, BiCalendar, BiDetail, BiRupee, BiDollar, BiEuro } from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddTransactionModal({ isOpen, onClose, transactionToEdit = null }) {
  const { addTransaction, updateTransaction, DEFAULT_CATEGORIES, settings } = useFinance();
  
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [receiptName, setReceiptName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type || 'expense');
      setAmount(transactionToEdit.amount || '');
      setCategory(transactionToEdit.category || '');
      setDate(transactionToEdit.date || new Date().toISOString().split('T')[0]);
      setNote(transactionToEdit.note || '');
      setReceipt(transactionToEdit.receipt || null);
      setReceiptName(transactionToEdit.receiptName || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setReceipt(null);
      setReceiptName('');
    }
    setError('');
  }, [transactionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Receipt size should be less than 2MB');
      return;
    }

    setReceiptName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceipt(reader.result); // Base64 encoding
    };
    reader.readAsDataURL(file);
  };

  const getCurrencyIcon = () => {
    if (settings.currency === 'INR') return <span className="text-slate-500 dark:text-slate-400 font-bold">₹</span>;
    if (settings.currency === 'USD') return <span className="text-slate-500 dark:text-slate-400 font-bold">$</span>;
    return <span className="text-slate-500 dark:text-slate-400 font-bold">€</span>;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!category) {
      setError('Please select a category');
      return;
    }
    if (!date) {
      setError('Please select a transaction date');
      return;
    }

    setLoading(true);
    const txData = {
      type,
      amount: Number(amount),
      category,
      date,
      note,
      receipt,
      receiptName
    };

    try {
      if (transactionToEdit) {
        await updateTransaction(transactionToEdit.id, txData);
      } else {
        await addTransaction(txData);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-md rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200/30 dark:border-slate-800/30 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-heading">
              {transactionToEdit ? 'Edit Transaction' : 'Add Transaction'}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <BiX className="text-xl" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Type Selector (Income / Expense) */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  type === 'income'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Income
              </button>
            </div>

            {/* Amount Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Amount
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-lg">
                  {getCurrencyIcon()}
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                required
              >
                <option value="" className="text-slate-800 dark:bg-slate-900">Select Category</option>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name} className="text-slate-800 dark:bg-slate-900">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <BiCalendar /> Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <BiDetail /> Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Starbucks"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm"
                />
              </div>
            </div>

            {/* Receipt Upload */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <BiUpload /> Receipt Image
              </label>
              <div className="relative group flex flex-col items-center justify-center p-4 border border-dashed border-slate-350 dark:border-slate-800 hover:border-brand-500 rounded-2xl cursor-pointer bg-slate-50/10 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {receipt ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={receipt} alt="Receipt preview" className="w-16 h-16 object-cover rounded-lg border dark:border-slate-700" />
                    <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold truncate max-w-[200px]">{receiptName || 'Receipt uploaded'}</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Click or Drag receipt here (Max 2MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100/30 dark:hover:bg-slate-800/30 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-violet-500 hover:from-brand-500 hover:to-violet-400 text-white font-semibold shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all text-sm"
              >
                {loading ? 'Saving...' : transactionToEdit ? 'Save Changes' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
