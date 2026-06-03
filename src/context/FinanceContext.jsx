/* eslint-disable */
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { dbService } from '../services/dbService';
import { aiService } from '../services/aiService';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#f43f5e', icon: 'BiFoodMenu', bg: 'bg-rose-500/10 text-rose-500' },
  { name: 'Travel', color: '#0ea5e9', icon: 'BiCompass', bg: 'bg-sky-500/10 text-sky-500' },
  { name: 'Shopping', color: '#f59e0b', icon: 'BiShoppingBag', bg: 'bg-amber-500/10 text-amber-500' },
  { name: 'Entertainment', color: '#8b5cf6', icon: 'BiTv', bg: 'bg-violet-500/10 text-violet-500' },
  { name: 'Education', color: '#10b981', icon: 'BiBookOpen', bg: 'bg-emerald-500/10 text-emerald-500' },
  { name: 'Health', color: '#14b8a6', icon: 'BiPlusMedical', bg: 'bg-teal-500/10 text-teal-500' },
  { name: 'Bills', color: '#64748b', icon: 'BiReceipt', bg: 'bg-slate-500/10 text-slate-500' },
  { name: 'Investment', color: '#84cc16', icon: 'BiTrendingUp', bg: 'bg-lime-500/10 text-lime-500' }
];

export const FinanceProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [goals, setGoals] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [settings, setSettings] = useState({
    currency: 'INR',
    notifications: true,
    emailNotifications: false,
    weeklySummary: true,
    warningThreshold: 80,
  });
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user data on auth change
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTransactions([]);
      setBudgets({});
      setGoals([]);
      setSubscriptions([]);
      setDebts([]);
      setInsights([]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        let txList = await dbService.getTransactions(user.uid);
        let budgetList = await dbService.getBudgets(user.uid);
        let goalList = await dbService.getGoals(user.uid);
        let subList = await dbService.getSubscriptions(user.uid);
        let debtList = await dbService.getDebts(user.uid);
        const profileSettings = await dbService.getProfileSettings(user.uid);

        if (txList.length === 0 && Object.keys(budgetList).length === 0 && goalList.length === 0 && subList.length === 0 && debtList.length === 0) {
          // Seed standard transactions
          const initialTransactions = [
            { type: 'income', amount: 95000, category: 'Investment', note: 'Monthly Salary Deposit', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { type: 'expense', amount: 8500, category: 'Food', note: 'Organic Groceries & Supplies', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { type: 'expense', amount: 4200, category: 'Travel', note: 'Uber commutes & Train fare', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { type: 'expense', amount: 12000, category: 'Shopping', note: 'Winter Leather Jacket', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { type: 'expense', amount: 3500, category: 'Entertainment', note: 'Netflix Premium & Cinema', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { type: 'expense', amount: 6000, category: 'Bills', note: 'Electricity & Broadband Internet', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
          ];
          
          const initialBudgets = {
            'Food': 15000,
            'Travel': 6000,
            'Shopping': 10000,
            'Entertainment': 5000
          };
          
          const initialGoals = [
            { name: 'New Laptop', target: 120000, saved: 45000 },
            { name: 'Emergency Fund', target: 50000, saved: 20000 },
            { name: 'Japan Vacation', target: 200000, saved: 60000 }
          ];

          const initialSubscriptions = [
            { name: 'Netflix Premium', amount: 649, billingCycle: 'monthly', category: 'Entertainment', nextBillDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { name: 'Spotify Duo', amount: 149, billingCycle: 'monthly', category: 'Entertainment', nextBillDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { name: 'Adobe Creative Suite', amount: 2396, billingCycle: 'monthly', category: 'Education', nextBillDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
            { name: 'Gym Membership', amount: 1500, billingCycle: 'monthly', category: 'Health', nextBillDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
          ];

          const initialDebts = [
            { name: 'HDFC Car Loan', amount: 500000, repaid: 180000, emi: 12500, interestRate: 8.5 },
            { name: 'Student Loan', amount: 300000, repaid: 90000, emi: 8000, interestRate: 6.8 },
            { name: 'Credit Card Outstanding', amount: 45000, repaid: 15000, emi: 5000, interestRate: 12.0 }
          ];

          await Promise.all([
            ...initialTransactions.map(tx => dbService.addTransaction(user.uid, tx)),
            ...Object.entries(initialBudgets).map(([cat, limit]) => dbService.setBudget(user.uid, cat, limit)),
            ...initialGoals.map(g => dbService.addGoal(user.uid, g)),
            ...initialSubscriptions.map(s => dbService.addSubscription(user.uid, s)),
            ...initialDebts.map(d => dbService.addDebt(user.uid, d))
          ]);

          txList = await dbService.getTransactions(user.uid);
          budgetList = await dbService.getBudgets(user.uid);
          goalList = await dbService.getGoals(user.uid);
          subList = await dbService.getSubscriptions(user.uid);
          debtList = await dbService.getDebts(user.uid);
        }

        setTransactions(txList);
        setBudgets(budgetList);
        setGoals(goalList);
        setSubscriptions(subList);
        setDebts(debtList);
        setSettings(profileSettings);
      } catch (err) {
        console.error("Error loading user finance data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Recalculate AI insights when transactions, budgets, goals, or settings change
  useEffect(() => {
    if (!user) return;
    const computedInsights = aiService.generateInsights(transactions, budgets, goals, settings);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInsights(computedInsights);
  }, [transactions, budgets, goals, settings, user]);

  // --- Transactions API ---
  const addTransaction = async (tx) => {
    if (!user) return;
    const addedTx = await dbService.addTransaction(user.uid, tx);
    setTransactions(prev => [addedTx, ...prev]);
    return addedTx;
  };

  const updateTransaction = async (id, updatedFields) => {
    if (!user) return;
    const updated = await dbService.updateTransaction(user.uid, id, updatedFields);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
    return updated;
  };

  const deleteTransaction = async (id) => {
    if (!user) return;
    await dbService.deleteTransaction(user.uid, id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // --- Budgets API ---
  const setBudget = async (category, limit) => {
    if (!user) return;
    await dbService.setBudget(user.uid, category, limit);
    setBudgets(prev => ({ ...prev, [category]: limit }));
  };

  // --- Goals API ---
  const addGoal = async (goal) => {
    if (!user) return;
    const addedGoal = await dbService.addGoal(user.uid, goal);
    setGoals(prev => [...prev, addedGoal]);
    return addedGoal;
  };

  const updateGoal = async (id, updatedFields) => {
    if (!user) return;
    const updated = await dbService.updateGoal(user.uid, id, updatedFields);
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updated } : g));
    return updated;
  };

  const deleteGoal = async (id) => {
    if (!user) return;
    await dbService.deleteGoal(user.uid, id);
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addFundsToGoal = async (id, amount) => {
    if (!user) return;
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    
    const newSaved = Math.min(goal.target, goal.saved + Number(amount));
    const updatedGoal = await updateGoal(id, { saved: newSaved });

    await addTransaction({
      type: 'expense',
      amount: Number(amount),
      category: 'Investment',
      date: new Date().toISOString().split('T')[0],
      note: `Saved for: ${goal.name}`
    });

    return updatedGoal;
  };

  // --- Subscriptions API ---
  const addSubscription = async (sub) => {
    if (!user) return;
    const addedSub = await dbService.addSubscription(user.uid, sub);
    setSubscriptions(prev => [...prev, addedSub]);
    
    await addTransaction({
      type: 'expense',
      amount: Number(sub.amount),
      category: sub.category || 'Bills',
      date: new Date().toISOString().split('T')[0],
      note: `Subscription: ${sub.name}`
    });
    
    return addedSub;
  };

  const deleteSubscription = async (id) => {
    if (!user) return;
    await dbService.deleteSubscription(user.uid, id);
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  // --- Debts API ---
  const addDebt = async (debt) => {
    if (!user) return;
    const addedDebt = await dbService.addDebt(user.uid, debt);
    setDebts(prev => [...prev, addedDebt]);
    return addedDebt;
  };

  const repayDebt = async (id, amount) => {
    if (!user) return;
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    const newRepaid = Math.min(debt.amount, debt.repaid + Number(amount));
    const updatedFields = { repaid: newRepaid };
    await dbService.updateDebt(user.uid, id, updatedFields);
    
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields } : d));

    await addTransaction({
      type: 'expense',
      amount: Number(amount),
      category: 'Bills',
      date: new Date().toISOString().split('T')[0],
      note: `Repayment: ${debt.name}`
    });
  };

  const deleteDebt = async (id) => {
    if (!user) return;
    await dbService.deleteDebt(user.uid, id);
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  // --- Settings API ---
  const updateSettings = async (newSettings) => {
    if (!user) return;
    const updated = await dbService.updateProfileSettings(user.uid, newSettings);
    setSettings(prev => ({ ...prev, ...updated }));
    return updated;
  };

  // --- DERIVED METRICS ---
  const balanceMetrics = useMemo(() => {
    const incomeTotal = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const expenseTotal = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const savingsTotal = incomeTotal - expenseTotal;

    return {
      income: incomeTotal,
      expenses: expenseTotal,
      balance: savingsTotal
    };
  }, [transactions]);

  const value = {
    transactions,
    budgets,
    goals,
    subscriptions,
    debts,
    settings,
    insights,
    loading,
    DEFAULT_CATEGORIES,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addFundsToGoal,
    addSubscription,
    deleteSubscription,
    addDebt,
    repayDebt,
    deleteDebt,
    updateSettings,
    ...balanceMetrics
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
