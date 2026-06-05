import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate authentication check
    if (email && password.length >= 6) {
      login({ name: email.split('@')[0], email });
      navigate('/dashboard');
    } else {
      setError('Invalid email or password (min 6 chars)');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="card" 
        style={{ width: '100%', maxWidth: '400px', padding: '3rem 2rem' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', color: 'var(--primary)' }}>
            <Wallet size={40} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sign in to continue to MoneyFlow</p>
        </div>

        {error && <div style={{ padding: '0.75rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email Address</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" placeholder="you@example.com" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
              <a href="#" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>Forgot password?</a>
            </div>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" placeholder="••••••••" />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem' }}>
            Sign In
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
