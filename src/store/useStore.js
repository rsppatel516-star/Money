import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Initial mock data to populate the store if empty
const initialTransactions = [
  { id: 1, name: 'Apple Music', category: 'Subscription', amount: -99, date: new Date().toISOString().split('T')[0], icon: '🎵', paymentMethod: 'Credit Card' },
  { id: 2, name: 'Salary', category: 'Income', amount: 85000, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], icon: '💼', paymentMethod: 'Net Banking' },
  { id: 3, name: 'Reliance Fresh', category: 'Groceries', amount: -4250, date: new Date(Date.now() - 172800000).toISOString().split('T')[0], icon: '🛒', paymentMethod: 'UPI' },
  { id: 4, name: 'Netflix', category: 'Subscription', amount: -649, date: new Date(Date.now() - 259200000).toISOString().split('T')[0], icon: '🍿', paymentMethod: 'Credit Card' },
  { id: 5, name: 'Electric Bill', category: 'Utilities', amount: -2450, date: new Date(Date.now() - 345600000).toISOString().split('T')[0], icon: '⚡', paymentMethod: 'UPI' },
];

const initialSubscriptions = [
  { id: 1, name: 'Netflix', cost: 649, cycle: 'Monthly', nextPayment: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], icon: '🍿' },
  { id: 2, name: 'Apple Music', cost: 99, cycle: 'Monthly', nextPayment: new Date(Date.now() + 86400000 * 17).toISOString().split('T')[0], icon: '🎵' },
  { id: 3, name: 'Gym Membership', cost: 1500, cycle: 'Monthly', nextPayment: new Date(Date.now() + 86400000 * 25).toISOString().split('T')[0], icon: '💪' },
];

const initialBudgets = [
  { id: 1, category: 'Food', limit: 15000, spent: 8500, color: 'var(--danger)', icon: '🍱' },
  { id: 2, category: 'Travel', limit: 6000, spent: 0, color: 'var(--primary)', icon: '✈️' },
  { id: 3, category: 'Shopping', limit: 10000, spent: 0, color: 'var(--warning)', icon: '🛍️' },
  { id: 4, category: 'Entertainment', limit: 5000, spent: 0, color: '#8b5cf6', icon: '📺' },
  { id: 5, category: 'Education', limit: 0, spent: 0, color: 'var(--success)', icon: '📚' },
  { id: 6, category: 'Health', limit: 0, spent: 0, color: 'var(--success)', icon: '⚕️' },
  { id: 7, category: 'Bills', limit: 0, spent: 0, color: 'var(--text-muted)', icon: '🧾' },
  { id: 8, category: 'Investment', limit: 0, spent: 0, color: 'var(--success)', icon: '📈' },
];

const initialDebts = [
  { id: 1, name: 'HDFC Car Loan', interest: 8.5, outstanding: 320000, total: 500000, repaid: 180000, emi: 12500 },
  { id: 2, name: 'Student Loan', interest: 6.8, outstanding: 210000, total: 300000, repaid: 90000, emi: 8000 },
  { id: 3, name: 'Credit Card Outstanding', interest: 12.0, outstanding: 30000, total: 45000, repaid: 15000, emi: 5000 },
];

const initialAiMessages = [
  { id: 1, sender: 'ai', text: 'Hello Rudra Patel! I\'m your MoneyFlow AI Coach. I\'ve analyzed your financial data. What would you like to review today?', timestamp: '01:41 PM' }
];

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
      
      // Subscriptions State
      subscriptions: initialSubscriptions,
      addSubscription: (sub) => set((state) => ({ subscriptions: [sub, ...state.subscriptions] })),
      removeSubscription: (id) => set((state) => ({ subscriptions: state.subscriptions.filter(s => s.id !== id) })),
      
      // Goals State
      goals: [
        { id: 1, name: 'New Laptop', current: 45000, target: 120000, color: '#8b5cf6', icon: '💻' },
        { id: 2, name: 'Emergency Fund', current: 20000, target: 50000, color: '#8b5cf6', icon: '🏦' },
        { id: 3, name: 'Japan Vacation', current: 60000, target: 200000, color: '#8b5cf6', icon: '✈️' },
      ],
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      removeGoal: (id) => set((state) => ({ goals: state.goals.filter(g => g.id !== id) })),
      updateGoal: (id, amount) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, current: g.current + amount } : g)
      })),

      // Budgets State
      budgets: initialBudgets,
      updateBudget: (id, limit) => set((state) => ({
        budgets: state.budgets.map(b => b.id === id ? { ...b, limit } : b)
      })),

      // Debts State
      debts: initialDebts,
      addDebt: (debt) => set((state) => ({ debts: [...state.debts, debt] })),
      removeDebt: (id) => set((state) => ({ debts: state.debts.filter(d => d.id !== id) })),
      recordDebtPayment: (id, amount) => set((state) => ({
        debts: state.debts.map(d => d.id === id ? { ...d, outstanding: d.outstanding - amount, repaid: d.repaid + amount } : d)
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
