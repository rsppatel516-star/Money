/* eslint-disable */
import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { BiPlus, BiTrash, BiCalendar, BiTime, BiReceipt, BiX } from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Subscriptions() {
  const { subscriptions, addSubscription, deleteSubscription, settings } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [category, setCategory] = useState('Entertainment');
  const [nextBillDate, setNextBillDate] = useState('');

  // Calculate monthly total projection
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    const val = Number(sub.amount) || 0;
    return sum + (sub.billingCycle === 'yearly' ? val / 12 : val);
  }, 0);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: settings?.currency || 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getDaysRemaining = (dateStr) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleAddSub = async (e) => {
    e.preventDefault();
    if (!name || !amount || !nextBillDate) return;

    await addSubscription({
      name,
      amount: Number(amount),
      billingCycle,
      category,
      nextBillDate
    });

    // Reset Form
    setName('');
    setAmount('');
    setBillingCycle('monthly');
    setCategory('Entertainment');
    setNextBillDate('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 font-heading">
            Recurring Bills & Subscriptions
          </h2>
          <p className="text-slate-500 text-sm">
            Keep track of automatic utility bills, memberships, and licenses.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 text-white font-semibold shadow-lg shadow-brand-500/20 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
        >
          <BiPlus className="text-xl" />
          Add Subscription
        </button>
      </div>

      {/* Projection Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Monthly Cost Projection
          </span>
          <h3 className="text-3xl font-extrabold text-brand-600 font-heading">
            {formatCurrency(totalMonthly)}
          </h3>
          <p className="text-slate-400 text-xs mt-2">
            Average cost calculated from active licenses.
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Yearly Projection
          </span>
          <h3 className="text-3xl font-extrabold text-violet-600 font-heading">
            {formatCurrency(totalMonthly * 12)}
          </h3>
          <p className="text-slate-400 text-xs mt-2">
            Total recurring expenditures per calendar year.
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Active Subscriptions
          </span>
          <h3 className="text-3xl font-extrabold text-emerald-600 font-heading">
            {subscriptions.length}
          </h3>
          <p className="text-slate-400 text-xs mt-2">
            Currently tracking recurring payments.
          </p>
        </div>
      </div>

      {/* Subscriptions Grid */}
      {subscriptions.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-md border border-slate-200/50 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BiReceipt className="text-3xl text-brand-500" />
          </div>
          <h4 className="font-bold text-slate-700 mb-1">No Active Subscriptions</h4>
          <p className="text-slate-400 text-sm mb-6">
            Log your regular bills (Rent, Netflix, Broadband) to projection systems.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-semibold transition-colors"
          >
            Add First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub) => {
            const daysLeft = getDaysRemaining(sub.nextBillDate);
            let alertColor = 'bg-slate-100 text-slate-600';
            if (daysLeft !== null) {
              if (daysLeft <= 3) alertColor = 'bg-rose-50 text-rose-600 border border-rose-100';
              else if (daysLeft <= 7) alertColor = 'bg-amber-50 text-amber-600 border border-amber-100';
              else alertColor = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            }

            return (
              <motion.div
                key={sub.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/80 backdrop-blur-md border border-slate-200/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
              >
                <div>
                  {/* Top Line */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center font-bold text-brand-600 font-heading text-lg">
                        {sub.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-700 leading-tight">
                          {sub.name}
                        </h4>
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full mt-1 inline-block">
                          {sub.category}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSubscription(sub.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Remove"
                    >
                      <BiTrash className="text-lg" />
                    </button>
                  </div>

                  {/* Financial Value */}
                  <div className="my-5">
                    <h5 className="text-2xl font-extrabold text-slate-800 font-heading">
                      {formatCurrency(sub.amount)}
                      <span className="text-slate-400 text-xs font-normal">
                        {' '}/ {sub.billingCycle}
                      </span>
                    </h5>
                  </div>
                </div>

                {/* Footer Details */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <BiCalendar className="text-slate-400" />
                    <span>Next: {sub.nextBillDate}</span>
                  </div>
                  {daysLeft !== null && (
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${alertColor}`}>
                      {daysLeft <= 0 ? 'Due Today' : `In ${daysLeft} days`}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Creation Modal overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border border-slate-200 relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 font-heading flex items-center gap-2">
                  <BiReceipt className="text-xl text-brand-600" />
                  Add Subscription Plan
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <BiX className="text-2xl" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleAddSub} className="space-y-4 pt-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                    Plan / Bill Title
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Netflix Premium, Rent, Office Space"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                      Amount Cost
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                      Billing Interval
                    </label>
                    <select
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-700"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-700"
                    >
                      <option value="Entertainment">Entertainment</option>
                      <option value="Bills">Bills</option>
                      <option value="Food">Food</option>
                      <option value="Health">Health</option>
                      <option value="Education">Education</option>
                      <option value="Travel">Travel</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Investment">Investment</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                      Next Billing Date
                    </label>
                    <input
                      type="date"
                      required
                      value={nextBillDate}
                      onChange={(e) => setNextBillDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-700"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-semibold hover:bg-slate-50 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 text-sm shadow-md transition-colors"
                  >
                    Add Plan
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
