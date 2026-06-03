/* eslint-disable */
import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import TransactionCard from '../components/TransactionCard';
import AddTransactionModal from '../components/AddTransactionModal';
import { exportToCSV } from '../utils/csvExport';
import { exportToPDF } from '../utils/pdfExport';
import { 
  BiSearch, 
  BiFilterAlt, 
  BiDownload, 
  BiReset, 
  BiChevronLeft, 
  BiChevronRight,
  BiTrendingUp,
  BiTrendingDown,
  BiChevronDown
} from 'react-icons/bi';

export default function Transactions() {
  const { transactions, DEFAULT_CATEGORIES, settings, income, expenses, balance } = useFinance();
  const { user } = useAuth();
  
  // Modal states for editing
  const [editingTx, setEditingTx] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  
  // Mobile filter collapse toggle
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // 1. Text Search matching note or category
      const noteMatch = tx.note?.toLowerCase().includes(search.toLowerCase());
      const catMatch = tx.category.toLowerCase().includes(search.toLowerCase());
      if (search && !noteMatch && !catMatch) return false;

      // 2. Type Filter
      if (type !== 'all' && tx.type !== type) return false;

      // 3. Category Filter
      if (category !== 'all' && tx.category !== category) return false;

      // 4. Date Range
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;

      // 5. Amount Range
      if (minAmount && Number(tx.amount) < Number(minAmount)) return false;
      if (maxAmount && Number(tx.amount) > Number(maxAmount)) return false;

      return true;
    });
  }, [transactions, search, type, category, startDate, endDate, minAmount, maxAmount]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setType('all');
    setCategory('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const handleEditClick = (tx) => {
    setEditingTx(tx);
    setIsEditModalOpen(true);
  };

  const handleCSVExport = () => {
    exportToCSV(filteredTransactions);
  };

  const handlePDFExport = () => {
    exportToPDF(filteredTransactions, user, { income, expenses, balance }, settings);
  };

  const currencySym = settings.currency === 'INR' ? '₹' : settings.currency === 'USD' ? '$' : '€';

  return (
    <div className="space-y-6">
      {/* Header and exports */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-heading tracking-tight leading-none">
            Transactions Statement
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Audit, filter and export your full expense logs.
          </p>
        </div>
        
        {/* Export Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCSVExport}
            disabled={filteredTransactions.length === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 flex items-center gap-2 text-sm font-semibold transition-all disabled:opacity-50"
          >
            <BiDownload /> CSV
          </button>
          <button
            onClick={handlePDFExport}
            disabled={filteredTransactions.length === 0}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-500 hover:from-brand-500 hover:to-violet-400 text-white flex items-center gap-2 text-sm font-semibold transition-all shadow-md shadow-brand-500/10 disabled:opacity-50"
          >
            <BiDownload /> PDF Report
          </button>
        </div>
      </div>

      {/* Search & Collapse Toggle for Filters */}
      <div className="p-4 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main Search input */}
          <div className="flex-1 relative flex items-center">
            <BiSearch className="absolute left-4 text-slate-450 dark:text-slate-500 text-lg" />
            <input
              type="text"
              placeholder="Search by note or category..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-slate-800 dark:text-slate-150 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-sm"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border flex items-center gap-2 text-sm font-semibold transition-colors ${
                showFilters 
                  ? 'bg-brand-500/10 border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
              }`}
            >
              <BiFilterAlt /> Filters
              <BiChevronDown className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Reset Filters */}
            <button
              onClick={handleResetFilters}
              className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 flex items-center gap-1.5 text-sm font-semibold transition-colors"
              title="Reset Filters"
            >
              <BiReset className="text-lg" /> Reset
            </button>
          </div>
        </div>

        {/* Collapsible filter block */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-200/30 dark:border-slate-800/30 animate-fadeIn">
            {/* Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Type</label>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {DEFAULT_CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              />
            </div>

            {/* Amount Range */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Min & Max Amount</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => { setMinAmount(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-2 rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => { setMaxAmount(e.target.value); setCurrentPage(1); }}
                  className="w-full px-2 py-2 rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Grid (Desktop Table vs Mobile Cards) */}
      <div className="p-6 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col shadow-sm overflow-hidden">
        {/* Mobile View: list of Transaction Cards */}
        <div className="block md:hidden space-y-2.5">
          {paginatedTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              No transactions match your filter definitions.
            </div>
          ) : (
            paginatedTransactions.map((tx) => (
              <TransactionCard 
                key={tx.id} 
                transaction={tx} 
                onEdit={handleEditClick} 
              />
            ))
          )}
        </div>

        {/* Desktop View: beautiful table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/30 dark:border-slate-800/30 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50 text-xs">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                    No transactions match your search filters.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-500 dark:text-slate-400">
                      {tx.date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      <span className="px-2.5 py-1.5 rounded-lg bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/20 dark:border-slate-800/20">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                      {tx.note || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {tx.type === 'income' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <BiTrendingUp /> INCOME
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                          <BiTrendingDown /> EXPENSE
                        </span>
                      )}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-extrabold text-sm ${tx.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {tx.type === 'expense' ? '-' : '+'} {currencySym} {tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditClick(tx)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200/30 dark:border-slate-800/30 pt-4 mt-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 disabled:opacity-40 hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
              >
                <BiChevronLeft className="text-xl" />
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePageChange(idx + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === idx + 1
                      ? 'bg-brand-500 text-white'
                      : 'border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 disabled:opacity-40 hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
              >
                <BiChevronRight className="text-xl" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inline AddTransactionModal for editing purposes */}
      <AddTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingTx(null); }}
        transactionToEdit={editingTx}
      />
    </div>
  );
}
