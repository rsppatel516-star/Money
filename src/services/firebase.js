/* eslint-disable */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Environment variables can be configured in a .env file or inputted in Settings.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if config is filled (at least apiKey and projectId should be present)
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

let app;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("🔥 Firebase initialized successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase:", error);
  }
} else {
  console.log("ℹ️ Firebase credentials missing. MoneyFlow is running in Local Storage (Demo) Mode.");
}

export { auth, db, isFirebaseConfigured, firebaseConfig };
