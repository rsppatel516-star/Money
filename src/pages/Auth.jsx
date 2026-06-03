/* eslint-disable */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BiMailSend, BiLockOpen, BiUserCircle, BiSpreadsheet } from 'react-icons/bi';

export default function Auth() {
  const { login, register, authError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all credentials');
      return;
    }
    if (!isLogin && !name) {
      setError('Please provide your name');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err) {
        // eslint-disable-next-line no-unused-vars
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Direct mock credentials
      await login('demo@moneyflow.com', 'demopassword');
    } catch (err) {
      // If it doesn't exist yet, we register it
      try {
        await register('demo@moneyflow.com', 'demopassword', 'Demo User');
      } catch (regErr) {
        setError(regErr.message || 'Demo log-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-900 mesh-bg-dark">
      {/* Decorative Blob backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-brand-500/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl animate-pulse-slow" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md rounded-3xl glass-panel-dark border border-white/5 p-8 shadow-2xl flex flex-col gap-6 relative overflow-hidden"
      >
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <span className="text-white text-2xl font-bold font-heading">M</span>
          </div>
          <h1 className="text-2xl font-extrabold font-heading bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent mt-1 leading-none">
            MoneyFlow
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Smart Expense Tracker & Budget Planner
          </p>
        </div>

        {/* Auth Tab Picker */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950/60 border border-white/5">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isLogin 
                ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              !isLogin 
                ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Panels */}
        {(error || authError) && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error || authError}
          </div>
        )}

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative flex items-center">
                <BiUserCircle className="absolute left-4 text-slate-500 text-lg" />
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/5 bg-slate-950/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 text-sm"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <BiMailSend className="absolute left-4 text-slate-500 text-lg" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/5 bg-slate-950/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative flex items-center">
              <BiLockOpen className="absolute left-4 text-slate-500 text-lg" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/5 bg-slate-950/40 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 text-sm"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-brand-500 to-violet-500 hover:from-brand-400 hover:to-violet-400 text-white font-semibold shadow-lg shadow-brand-500/25 transition-all duration-200 text-sm disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex-1 h-[1px] bg-slate-800" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">OR</span>
          <div className="flex-1 h-[1px] bg-slate-800" />
        </div>

        {/* Demo Shortcut Button */}
        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/50 text-slate-300 font-semibold hover:text-white transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
        >
          <BiSpreadsheet className="text-lg text-emerald-500" />
          Try Instant Demo Profile
        </button>
      </motion.div>
    </div>
  );
}
