/* eslint-disable */
import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { BiPlus, BiMinus, BiTrash, BiTargetLock, BiPlusCircle, BiInfoCircle } from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';

export default function SavingsGoals() {
  const { goals, addGoal, deleteGoal, addFundsToGoal, settings, balance } = useFinance();

  // Create Goal States
  const [showAddForm, setShowAddForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  
  // Funding States
  const [fundingGoalId, setFundingGoalId] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundError, setFundError] = useState('');

  const currencySym = settings.currency === 'INR' ? '₹' : settings.currency === 'USD' ? '$' : '€';

  const formatCurrency = (val) => {
    return `${currencySym}${Math.round(val).toLocaleString()}`;
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalName || !targetAmount || Number(targetAmount) <= 0) return;

    await addGoal({
      name: goalName,
      target: Number(targetAmount)
    });

    setGoalName('');
    setTargetAmount('');
    setShowAddForm(false);
  };

  const handleAddFundsSubmit = async (e, goalId) => {
    e.preventDefault();
    setFundError('');

    if (!fundAmount || Number(fundAmount) <= 0) {
      setFundError('Enter a valid amount');
      return;
    }

    if (Number(fundAmount) > balance) {
      setFundError('Insufficient balance to allocate funds');
      return;
    }

    await addFundsToGoal(goalId, Number(fundAmount));
    setFundAmount('');
    setFundingGoalId(null);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-heading tracking-tight leading-none">
            Savings Goals
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Create targets for emergency funds or major purchases and allocate spare balance.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-500 hover:from-brand-500 hover:to-violet-400 text-white flex items-center justify-center gap-1 text-sm font-semibold transition-all shadow-md shadow-brand-500/10 cursor-pointer"
        >
          <BiPlus className="text-lg" /> Create Goal
        </button>
      </div>

      {/* Collapsible New Goal Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleCreateGoal}
              className="p-6 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row gap-4 shadow-sm items-end"
            >
              <div className="flex-1 space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. MacBook Pro"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-slate-800 dark:text-slate-150 focus:outline-none focus:border-brand-500 text-sm"
                  required
                />
              </div>

              <div className="flex-1 space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Amount ({currencySym})</label>
                <input
                  type="number"
                  placeholder="e.g. 80000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-slate-800 dark:text-slate-150 focus:outline-none focus:border-brand-500 text-sm"
                  required
                  min="1"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 md:flex-initial px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-brand-500/10"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Available Balance alert */}
      <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/10 flex items-center gap-3 text-xs text-brand-700 dark:text-brand-400">
        <BiInfoCircle className="text-lg shrink-0" />
        <span>You have <strong>{formatCurrency(balance)}</strong> available in your current balance. Depositing funds into goals acts as a savings allocation that adjusts your dashboard cash balance.</span>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          No savings goals created yet. Use the "Create Goal" button at the top right to configure your target!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const percentage = goal.target > 0 ? Math.min(100, (goal.saved / goal.target) * 100) : 0;
            const isCompleted = goal.saved >= goal.target;
            const isFundingThis = fundingGoalId === goal.id;

            return (
              <div 
                key={goal.id}
                className="p-6 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-805/50 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Completion glow decoration */}
                {isCompleted && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-[10px] font-bold text-white rounded-bl-xl uppercase tracking-wider shadow">
                    Completed
                  </div>
                )}

                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-500/10 text-brand-500'} flex items-center justify-center`}>
                      <BiTargetLock className="text-xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {goal.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        Savings Target
                      </p>
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                    title="Delete Goal"
                  >
                    <BiTrash className="text-sm" />
                  </button>
                </div>

                {/* Amount Figures */}
                <div className="flex justify-between items-baseline mt-1 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Saved:</span>
                    <span className="text-base font-extrabold text-slate-805 dark:text-slate-100 ml-1">
                      {formatCurrency(goal.saved)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-550 dark:text-slate-455 font-medium">Target:</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 ml-1">
                      {formatCurrency(goal.target)}
                    </span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-1.5">
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-brand-500 to-violet-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className={isCompleted ? 'text-emerald-500' : 'text-brand-500'}>
                      {percentage.toFixed(0)}% saved
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">
                      {isCompleted ? 'Goal Met!' : `${formatCurrency(goal.target - goal.saved)} to go`}
                    </span>
                  </div>
                </div>

                {/* Funding panel */}
                {!isCompleted && (
                  <div className="border-t border-slate-200/30 dark:border-slate-800/30 pt-3">
                    {isFundingThis ? (
                      <form onSubmit={(e) => handleAddFundsSubmit(e, goal.id)} className="space-y-2">
                        {fundError && (
                          <div className="text-[10px] text-rose-500 font-semibold">{fundError}</div>
                        )}
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            placeholder={`Deposit (${currencySym})`}
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                            required
                            min="1"
                          />
                          <button
                            type="button"
                            onClick={() => { setFundingGoalId(null); setFundAmount(''); setFundError(''); }}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs hover:bg-slate-100/50 dark:hover:bg-slate-800/30 font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white text-xs hover:bg-emerald-600 font-semibold transition-colors"
                          >
                            Deposit
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => { setFundingGoalId(goal.id); setFundAmount(''); setFundError(''); }}
                        className="w-full py-2 rounded-xl bg-brand-500/5 hover:bg-brand-500/10 border border-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <BiPlusCircle /> Deposit Savings
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
