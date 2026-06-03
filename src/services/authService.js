/* eslint-disable */
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  updateProfile as fbUpdateProfile
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

const LOCAL_USERS_KEY = 'moneyflow_local_users';
const CURRENT_USER_KEY = 'moneyflow_current_user';

// Mock sleep helper for realism in local mode
const sleep = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

const getLocalUsers = () => {
  const users = localStorage.getItem(LOCAL_USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const setLocalUsers = (users) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

export const authService = {
  // Sign up a new user
  async register(email, password, displayName, photoURL = '') {
    await sleep(600);
    
    if (isFirebaseConfigured && auth) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await fbUpdateProfile(userCredential.user, { displayName, photoURL });
      return userCredential.user;
    } else {
      const users = getLocalUsers();
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Email already in use.");
      }
      
      const newUser = {
        uid: 'local_' + Math.random().toString(36).substr(2, 9),
        email,
        displayName,
        photoURL: photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`,
        password // Stored in plain text for demonstration local-fallback only
      };
      
      users.push(newUser);
      setLocalUsers(users);
      
      const { password: _, ...userWithoutPassword } = newUser;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      return userWithoutPassword;
    }
  },

  // Log in existing user
  async login(email, password) {
    await sleep(500);
    
    if (isFirebaseConfigured && auth) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } else {
      const users = getLocalUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user || user.password !== password) {
        throw new Error("Invalid email or password.");
      }
      
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      return userWithoutPassword;
    }
  },

  // Sign out user
  async logout() {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    if (isFirebaseConfigured && auth) {
      return fbOnAuthStateChanged(auth, callback);
    } else {
      // Local state sync simulation
      const checkLocalUser = () => {
        const userStr = localStorage.getItem(CURRENT_USER_KEY);
        const user = userStr ? JSON.parse(userStr) : null;
        callback(user);
      };
      
      checkLocalUser();
      
      // Listen to storage events to support multi-tab demo sync
      const handler = (e) => {
        if (e.key === CURRENT_USER_KEY) {
          checkLocalUser();
        }
      };
      
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }
  },

  // Update profile metadata
  async updateProfile(displayName, photoURL) {
    await sleep(400);
    
    if (isFirebaseConfigured && auth && auth.currentUser) {
      await fbUpdateProfile(auth.currentUser, { displayName, photoURL });
      return auth.currentUser;
    } else {
      const userStr = localStorage.getItem(CURRENT_USER_KEY);
      if (!userStr) throw new Error("No authenticated user found.");
      
      const user = JSON.parse(userStr);
      const updatedUser = { ...user, displayName, photoURL };
      
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      
      // Update in users list
      const users = getLocalUsers();
      const updatedUsers = users.map(u => u.uid === user.uid ? { ...u, displayName, photoURL } : u);
      setLocalUsers(updatedUsers);
      
      // Dispatch storage event to trigger listener in this same window
      window.dispatchEvent(new StorageEvent('storage', { key: CURRENT_USER_KEY }));
      
      return updatedUser;
    }
  }
};
