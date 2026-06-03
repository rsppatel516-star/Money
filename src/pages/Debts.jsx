/* eslint-disable */
import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { BiPlus, BiTrash, BiCheckDouble, BiTrendingDown, BiCalendar, BiX } from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Debts() {
  const { debts, addDebt, repayDebt, deleteDebt, settings } = useFinance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [activeDebtId, setActiveDebtId] = useState(null);
  
  // Repay form states
  const [repayAmount, setRepayAmount] = useState('');

  // Add form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [repaid, setRepaid] = useState('0');
  const [emi, setEmi] = useState('');
  const [interestRate, setInterestRate] = useState('');

  // Calculated metrics
  const totalPrincipal = debts.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalRepaid = debts.reduce((sum, d) => sum + Number(d.repaid), 0);
  const totalOutstanding = totalPrincipal - totalRepaid;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: settings?.currency || 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleAddDebt = async (e) => {
    e.preventDefault();
    if (!name || !amount || !emi) return;

    await addDebt({
      name,
      amount: Number(amount),
      repaid: Number(repaid || 0),
      emi: Number(emi),
      interestRate: Number(interestRate || 0)
    });

    // Reset Form
    setName('');
    setAmount('');
    setRepaid('0');
    setEmi('');
    setInterestRate('');
    setIsAddModalOpen(false);
  };

  const handleRepaymentSubmit = async (e) => {
    e.preventDefault();
    if (!activeDebtId || !repayAmount) return;

    await repayDebt(activeDebtId, Number(repayAmount));
    setRepayAmount('');
    setIsRepayModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 font-heading">
            Loans & Debt Repayments
          </h2>
          <p className="text-slate-500 text-sm">
            Track active mortgages, credit card lines, and private loans.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
        >
          <BiPlus className="text-xl" />
          Add Debt Line
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-6 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Outstanding Debt
          </span>
          <h3 className="text-3xl font-extrabold text-rose-600 font-heading">
            {formatCurrency(totalOutstanding)}
          </h3>
          <p className="text-slate-400 text-xs mt-2">
            Remaining balance left to settle.
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-6 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Settled (Paid)
          </span>
          <h3 className="text-3xl font-extrabold text-emerald-600 font-heading">
            {formatCurrency(totalRepaid)}
          </h3>
          <p className="text-slate-400 text-xs mt-2">
            Accumulated repayment logs across entries.
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-6 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Settlement Progress
          </span>
          <div className="flex items-center justify-between mb-1.5 mt-1">
            <span className="text-sm font-bold text-slate-700">
              {totalPrincipal > 0 ? Math.round((totalRepaid / totalPrincipal) * 100) : 0}% Paid
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${totalPrincipal > 0 ? (totalRepaid / totalPrincipal) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Debts Grid */}
      {debts.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-md border border-slate-200/50 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BiTrendingDown className="text-3xl text-violet-500" />
          </div>
          <h4 className="font-bold text-slate-700 mb-1">Debt-Free Dashboard</h4>
          <p className="text-slate-400 text-sm mb-6">
            Congratulations! You currently have zero recorded outstanding loans or credit lines.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-semibold transition-colors"
          >
            Log Loan Balance
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {debts.map((debt) => {
            const pct = Math.min(100, Math.round((debt.repaid / debt.amount) * 100));
            const remaining = debt.amount - debt.repaid;

            return (
              <motion.div
                key={debt.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/80 backdrop-blur-md border border-slate-200/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-700 text-base leading-tight">
                        {debt.name}
                      </h4>
                      {debt.interestRate > 0 && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-md mt-1 inline-block">
                          {debt.interestRate}% Interest Rate
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteDebt(debt.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Remove"
                    >
                      <BiTrash className="text-lg" />
                    </button>
                  </div>

                  {/* Pricing Info */}
                  <div className="my-5 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                        Outstanding
                      </span>
                      <h5 className="text-xl font-extrabold text-slate-800 font-heading">
                        {formatCurrency(remaining)}
                      </h5>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                        Total Loan
                      </span>
                      <h5 className="text-base font-bold text-slate-500">
                        {formatCurrency(debt.amount)}
                      </h5>
                    </div>
                  </div>

                  {/* Progress Gauge */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Repaid: {formatCurrency(debt.repaid)}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Action items */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-slate-500 text-xs">
                    <span className="block text-[10px] uppercase font-semibold text-slate-400">Monthly EMI</span>
                    <span className="font-bold text-slate-600">{formatCurrency(debt.emi)} / mo</span>
                  </div>
                  {remaining > 0 ? (
                    <button
                      onClick={() => {
                        setActiveDebtId(debt.id);
                        setIsRepayModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-600 font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <BiCheckDouble className="text-base" />
                      Record Payment
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                      <BiCheckDouble className="text-base" /> Settled
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Debt Modal overlay */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border border-slate-200 relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 font-heading flex items-center gap-2">
                  <BiTrendingDown className="text-xl text-violet-600" />
                  Add Loan / Debt Line
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <BiX className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleAddDebt} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                    Debt Name / Creditor
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. HDFC Car Loan, Credit Card Bill"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                      Loan Principal
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Total Value"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                      Already Repaid
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={repaid}
                      onChange={(e) => setRepaid(e.target.value)}
                      placeholder="Paid Already"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                      Monthly EMI
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={emi}
                      onChange={(e) => setEmi(e.target.value)}
                      placeholder="EMI Installment"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      placeholder="e.g. 8.5"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white text-slate-700"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-semibold hover:bg-slate-50 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 text-sm shadow-md transition-colors"
                  >
                    Add Loan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Record Repayment Modal overlay */}
      <AnimatePresence>
        {isRepayModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-slate-200 relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 font-heading flex items-center gap-2">
                  <BiCheckDouble className="text-xl text-emerald-600" />
                  Repayment Payment
                </h3>
                <button
                  onClick={() => setIsRepayModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <BiX className="text-2xl" />
                </button>
              </div>

              <form onSubmit={handleRepaymentSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                    Amount Paid
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                    placeholder="Enter repaid value"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-700"
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Note: Recording this repayment adds an expense entry to your monthly ledger for budget checks.
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRepayModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-semibold hover:bg-slate-50 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 text-sm shadow-md transition-colors"
                  >
                    Submit Pay
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
