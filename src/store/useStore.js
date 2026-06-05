import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Initial mock data to populate the store if empty
const initialTransactions = [];
const initialSubscriptions = [];
const initialBudgets = [];
const initialDebts = [];
const initialAiMessages = [];

export const useStore = create(
  persist(
    (set) => ({
      // Authentication State
      user: null,
      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null }),
      
      // Transactions State
      transactions: initialTransactions,
      addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
      removeTransaction: (id) => set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) })),
      updateTransaction: (id, updatedTx) => set((state) => ({
        transactions: state.transactions.map(t => t.id === id ? { ...t, ...updatedTx } : t)
      })),
      
      // Subscriptions State
      subscriptions: initialSubscriptions,
      addSubscription: (sub) => set((state) => ({ subscriptions: [sub, ...state.subscriptions] })),
      removeSubscription: (id) => set((state) => ({ subscriptions: state.subscriptions.filter(s => s.id !== id) })),
      updateSubscription: (id, updatedSub) => set((state) => ({
        subscriptions: state.subscriptions.map(s => s.id === id ? { ...s, ...updatedSub } : s)
      })),
      
      // Goals State
      goals: [],
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      removeGoal: (id) => set((state) => ({ goals: state.goals.filter(g => g.id !== id) })),
      updateGoal: (id, amount) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, current: g.current + amount } : g)
      })),
      editGoal: (id, updatedGoal) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...updatedGoal } : g)
      })),

      // Budgets State
      budgets: initialBudgets,
      addBudget: (budget) => set((state) => ({ budgets: [...state.budgets, budget] })),
      removeBudget: (id) => set((state) => ({ budgets: state.budgets.filter(b => b.id !== id) })),
      updateBudget: (id, limit) => set((state) => ({
        budgets: state.budgets.map(b => b.id === id ? { ...b, limit } : b)
      })),
      editBudget: (id, updatedBudget) => set((state) => ({
        budgets: state.budgets.map(b => b.id === id ? { ...b, ...updatedBudget } : b)
      })),

      // Debts State
      debts: initialDebts,
      addDebt: (debt) => set((state) => ({ debts: [...state.debts, debt] })),
      removeDebt: (id) => set((state) => ({ debts: state.debts.filter(d => d.id !== id) })),
      recordDebtPayment: (id, amount) => set((state) => ({
        debts: state.debts.map(d => d.id === id ? { ...d, outstanding: d.outstanding - amount, repaid: d.repaid + amount } : d)
      })),
      updateDebt: (id, updatedDebt) => set((state) => ({
        debts: state.debts.map(d => d.id === id ? { ...d, ...updatedDebt } : d)
      })),

      // AI Messages State
      aiMessages: initialAiMessages,
      addAiMessage: (msg) => set((state) => ({ aiMessages: [...state.aiMessages, msg] })),
      
      // Settings State
      settings: {
        currency: 'INR',
        emailNotifications: true,
      },
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } }))
    }),
    {
      name: 'moneyflow-storage', // Key in localStorage
    }
  )
);
