/* eslint-disable */
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

// Helper to get local data
const getLocalData = (key, userId) => {
  const data = localStorage.getItem(`${key}_${userId}`);
  return data ? JSON.parse(data) : null;
};

// Helper to set local data
const setLocalData = (key, userId, data) => {
  localStorage.setItem(`${key}_${userId}`, JSON.stringify(data));
};

// Helper to sleep for realistic loads
const sleep = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const dbService = {
  // === TRANSACTIONS ===
  async getTransactions(userId) {
    await sleep();
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'users', userId, 'transactions'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const transactions = [];
        querySnapshot.forEach((doc) => {
          transactions.push({ id: doc.id, ...doc.data() });
        });
        return transactions;
      } catch (error) {
        console.error("Firestore getTransactions failed, falling back to LocalStorage:", error);
        return getLocalData('moneyflow_transactions', userId) || [];
      }
    } else {
      return getLocalData('moneyflow_transactions', userId) || [];
    }
  },

  async addTransaction(userId, transaction) {
    await sleep();
    const newTx = { ...transaction, createdAt: new Date().toISOString() };
    
    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'users', userId, 'transactions'), newTx);
        return { id: docRef.id, ...newTx };
      } catch (error) {
        console.error("Firestore addTransaction failed, writing to LocalStorage:", error);
      }
    }
    
    // Local fallback
    const localTx = { id: 'tx_' + Math.random().toString(36).substr(2, 9), ...newTx };
    const txs = getLocalData('moneyflow_transactions', userId) || [];
    txs.unshift(localTx); // Add to beginning
    setLocalData('moneyflow_transactions', userId, txs);
    return localTx;
  },

  async updateTransaction(userId, transactionId, updatedFields) {
    await sleep();
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'users', userId, 'transactions', transactionId);
        await updateDoc(docRef, updatedFields);
        return { id: transactionId, ...updatedFields };
      } catch (error) {
        console.error("Firestore updateTransaction failed, updating in LocalStorage:", error);
      }
    }
    
    // Local fallback
    const txs = getLocalData('moneyflow_transactions', userId) || [];
    const index = txs.findIndex(t => t.id === transactionId);
    if (index !== -1) {
      txs[index] = { ...txs[index], ...updatedFields };
      setLocalData('moneyflow_transactions', userId, txs);
      return txs[index];
    }
    throw new Error("Transaction not found for update");
  },

  async deleteTransaction(userId, transactionId) {
    await sleep();
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'users', userId, 'transactions', transactionId);
        await deleteDoc(docRef);
        return transactionId;
      } catch (error) {
        console.error("Firestore deleteTransaction failed, deleting in LocalStorage:", error);
      }
    }
    
    // Local fallback
    const txs = getLocalData('moneyflow_transactions', userId) || [];
    const filtered = txs.filter(t => t.id !== transactionId);
    setLocalData('moneyflow_transactions', userId, filtered);
    return transactionId;
  },

  // === BUDGETS ===
  async getBudgets(userId) {
    await sleep();
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'users', userId, 'budgets'));
        const budgets = {};
        querySnapshot.forEach((doc) => {
          budgets[doc.id] = doc.data().limit;
        });
        return budgets;
      } catch (error) {
        console.error("Firestore getBudgets failed, falling back to LocalStorage:", error);
        return getLocalData('moneyflow_budgets', userId) || {};
      }
    } else {
      return getLocalData('moneyflow_budgets', userId) || {};
    }
  },

  async setBudget(userId, category, limit) {
    await sleep();
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'users', userId, 'budgets', category);
        await setDoc(docRef, { limit });
        return { category, limit };
      } catch (error) {
        console.error("Firestore setBudget failed, saving to LocalStorage:", error);
      }
    }
    
    // Local fallback
    const budgets = getLocalData('moneyflow_budgets', userId) || {};
    budgets[category] = limit;
    setLocalData('moneyflow_budgets', userId, budgets);
    return { category, limit };
  },

  // === SAVINGS GOALS ===
  async getGoals(userId) {
    await sleep();
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'users', userId, 'goals'));
        const goals = [];
        querySnapshot.forEach((doc) => {
          goals.push({ id: doc.id, ...doc.data() });
        });
        return goals;
      } catch (error) {
        console.error("Firestore getGoals failed, falling back to LocalStorage:", error);
        return getLocalData('moneyflow_goals', userId) || [];
      }
    } else {
      return getLocalData('moneyflow_goals', userId) || [];
    }
  },

  async addGoal(userId, goal) {
    await sleep();
    const newGoal = { ...goal, saved: goal.saved ?? 0, createdAt: new Date().toISOString() };
    
    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'users', userId, 'goals'), newGoal);
        return { id: docRef.id, ...newGoal };
      } catch (error) {
        console.error("Firestore addGoal failed, writing to LocalStorage:", error);
      }
    }
    
    // Local fallback
    const localGoal = { id: 'goal_' + Math.random().toString(36).substr(2, 9), ...newGoal };
    const goals = getLocalData('moneyflow_goals', userId) || [];
    goals.push(localGoal);
    setLocalData('moneyflow_goals', userId, goals);
    return localGoal;
  },

  async updateGoal(userId, goalId, updatedFields) {
    await sleep();
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'users', userId, 'goals', goalId);
        await updateDoc(docRef, updatedFields);
        return { id: goalId, ...updatedFields };
      } catch (error) {
        console.error("Firestore updateGoal failed, updating in LocalStorage:", error);
      }
    }
    
    // Local fallback
    const goals = getLocalData('moneyflow_goals', userId) || [];
    const index = goals.findIndex(g => g.id === goalId);
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updatedFields };
      setLocalData('moneyflow_goals', userId, goals);
      return goals[index];
    }
    throw new Error("Goal not found for update");
  },

  async deleteGoal(userId, goalId) {
    await sleep();
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'users', userId, 'goals', goalId);
        await deleteDoc(docRef);
        return goalId;
      } catch (error) {
        console.error("Firestore deleteGoal failed, deleting in LocalStorage:", error);
      }
    }
    
    // Local fallback
    const goals = getLocalData('moneyflow_goals', userId) || [];
    const filtered = goals.filter(g => g.id !== goalId);
    setLocalData('moneyflow_goals', userId, filtered);
    return goalId;
  },

  // === SUBSCRIPTIONS ===
  async getSubscriptions(userId) {
    await sleep();
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'users', userId, 'subscriptions'));
        const subscriptions = [];
        querySnapshot.forEach((doc) => {
          subscriptions.push({ id: doc.id, ...doc.data() });
        });
        return subscriptions;
      } catch (error) {
        console.error("Firestore getSubscriptions failed, falling back to LocalStorage:", error);
        return getLocalData('moneyflow_subscriptions', userId) || [];
      }
    } else {
      return getLocalData('moneyflow_subscriptions', userId) || [];
    }
  },

  async addSubscription(userId, sub) {
    await sleep();
    const newSub = { ...sub, createdAt: new Date().toISOString() };
    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'users', userId, 'subscriptions'), newSub);
        return { id: docRef.id, ...newSub };
      } catch (error) {
        console.error("Firestore addSubscription failed, writing to LocalStorage:", error);
      }
    }
    const localSub = { id: 'sub_' + Math.random().toString(36).substr(2, 9), ...newSub };
    const subs = getLocalData('moneyflow_subscriptions', userId) || [];
    subs.push(localSub);
    setLocalData('moneyflow_subscriptions', userId, subs);
    return localSub;
  },

  async deleteSubscription(userId, subId) {
    await sleep();
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'users', userId, 'subscriptions', subId);
        await deleteDoc(docRef);
        return subId;
      } catch (error) {
        console.error("Firestore deleteSubscription failed, deleting in LocalStorage:", error);
      }
    }
    const subs = getLocalData('moneyflow_subscriptions', userId) || [];
    const filtered = subs.filter(s => s.id !== subId);
    setLocalData('moneyflow_subscriptions', userId, filtered);
    return subId;
  },

  // === DEBTS ===
  async getDebts(userId) {
    await sleep();
    if (isFirebaseConfigured && db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'users', userId, 'debts'));
        const debts = [];
        querySnapshot.forEach((doc) => {
          debts.push({ id: doc.id, ...doc.data() });
        });
        return debts;
      } catch (error) {
        console.error("Firestore getDebts failed, falling back to LocalStorage:", error);
        return getLocalData('moneyflow_debts', userId) || [];
      }
    } else {
      return getLocalData('moneyflow_debts', userId) || [];
    }
  },

  async addDebt(userId, debt) {
    await sleep();
    const newDebt = { ...debt, repaid: debt.repaid ?? 0, createdAt: new Date().toISOString() };
    if (isFirebaseConfigured && db) {
      try {
        const docRef = await addDoc(collection(db, 'users', userId, 'debts'), newDebt);
        return { id: docRef.id, ...newDebt };
      } catch (error) {
        console.error("Firestore addDebt failed, writing to LocalStorage:", error);
      }
    }
    const localDebt = { id: 'debt_' + Math.random().toString(36).substr(2, 9), ...newDebt };
    const debts = getLocalData('moneyflow_debts', userId) || [];
    debts.push(localDebt);
    setLocalData('moneyflow_debts', userId, debts);
    return localDebt;
  },

  async updateDebt(userId, debtId, updatedFields) {
    await sleep();
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'users', userId, 'debts', debtId);
        await updateDoc(docRef, updatedFields);
        return { id: debtId, ...updatedFields };
      } catch (error) {
        console.error("Firestore updateDebt failed, updating in LocalStorage:", error);
      }
    }
    const debts = getLocalData('moneyflow_debts', userId) || [];
    const index = debts.findIndex(d => d.id === debtId);
    if (index !== -1) {
      debts[index] = { ...debts[index], ...updatedFields };
      setLocalData('moneyflow_debts', userId, debts);
      return debts[index];
    }
    throw new Error("Debt not found for update");
  },

  async deleteDebt(userId, debtId) {
    await sleep();
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'users', userId, 'debts', debtId);
        await deleteDoc(docRef);
        return debtId;
      } catch (error) {
        console.error("Firestore deleteDebt failed, deleting in LocalStorage:", error);
      }
    }
    const debts = getLocalData('moneyflow_debts', userId) || [];
    const filtered = debts.filter(d => d.id !== debtId);
    setLocalData('moneyflow_debts', userId, filtered);
    return debtId;
  },

  // === USER PROFILE CONFIGURATIONS ===
  async getProfileSettings(userId) {
    await sleep();
    const defaults = {
      currency: 'INR',
      notifications: true,
      emailNotifications: false,
      weeklySummary: true,
      warningThreshold: 80, // Warn when budget reaches 80%
    };
    
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'users', userId, 'profile', 'settings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { ...defaults, ...docSnap.data() };
        }
        return defaults;
      } catch (error) {
        console.error("Firestore getProfileSettings failed, falling back to LocalStorage:", error);
        return getLocalData('moneyflow_settings', userId) || defaults;
      }
    } else {
      return getLocalData('moneyflow_settings', userId) || defaults;
    }
  },

  async updateProfileSettings(userId, settings) {
    await sleep();
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'users', userId, 'profile', 'settings');
        await setDoc(docRef, settings, { merge: true });
        return settings;
      } catch (error) {
        console.error("Firestore updateProfileSettings failed, saving to LocalStorage:", error);
      }
    }
    
    // Local fallback
    const current = getLocalData('moneyflow_settings', userId) || {};
    const updated = { ...current, ...settings };
    setLocalData('moneyflow_settings', userId, updated);
    return updated;
  }
};
