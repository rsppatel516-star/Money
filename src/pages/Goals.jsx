import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowDownToLine, Info, X, Target, User, Users } from 'lucide-react';
import { useStore } from '../store/useStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Goals() {
  const goals = useStore(state => state.goals) || [];
  const addGoal = useStore(state => state.addGoal);
  const removeGoal = useStore(state => state.removeGoal);
  const updateGoal = useStore(state => state.updateGoal);
  
  // Modals state
  const [activeTab, setActiveTab] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalOwner, setNewGoalOwner] = useState('Joint');
  
  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Calculate a mock "available balance" based on total income - expenses
  const transactions = useStore(state => state.transactions) || [];
  const availableBalance = transactions.reduce((acc, t) => acc + t.amount, 0);

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (newGoalName && newGoalTarget) {
      addGoal({
        id: Date.now(),
        name: newGoalName,
        current: 0,
        target: parseFloat(newGoalTarget),
        owner: newGoalOwner,
        color: 'var(--primary)',
        icon: '🎯'
      });
      setIsAddModalOpen(false);
      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalOwner('Joint');
    }
  };

  const handleDeposit = (e) => {
    e.preventDefault();
    if (depositGoalId && depositAmount) {
      updateGoal(depositGoalId, parseFloat(depositAmount));
      setDepositGoalId(null);
      setDepositAmount('');
    }
  };

  const filteredGoals = activeTab === 'All' ? goals : goals.filter(g => g.owner === activeTab || g.owner === 'Joint');
  const totalSaved = filteredGoals.reduce((acc, g) => acc + g.current, 0);
  const totalTarget = filteredGoals.reduce((acc, g) => acc + g.target, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Create targets for emergency funds or major purchases.
          </p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Create Goal</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {['All', 'Rudra Patel', 'Girishbhai Patel'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'All' ? <Users size={16} /> : <User size={16} />}
            {tab}
          </button>
        ))}
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <motion.div variants={itemVariants} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="card-header">
            <span className="card-title">Goal Summary ({activeTab})</span>
            <Target size={20} className="text-primary" />
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Saved: ₹{totalSaved.toLocaleString()}</span>
              <span style={{ fontWeight: 600 }}>Target: ₹{totalTarget.toLocaleString()}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill primary" 
                style={{ width: `${totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Info size={24} className="text-primary" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--text-main)' }}>
            You have <strong style={{ color: 'var(--primary)' }}>₹{availableBalance.toLocaleString()}</strong> available in your current balance. Depositing funds into goals acts as a savings allocation.
          </p>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {filteredGoals.map(goal => {
          const percentSaved = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const remaining = Math.max(0, goal.target - goal.current);

          return (
            <motion.div key={goal.id} variants={itemVariants} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                    {goal.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{goal.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Owner: {goal.owner || 'Joint'}</span>
                  </div>
                </div>
                <button onClick={() => removeGoal(goal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} title="Delete Goal">
                  <Trash2 size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Saved:</span> <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{goal.current.toLocaleString()}</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Target:</span> <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{goal.target.toLocaleString()}</span></div>
              </div>

              <div className="progress-bar" style={{ margin: '0.75rem 0' }}>
                <div className="progress-fill primary" style={{ width: `${percentSaved}%` }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                <span className="text-primary">{percentSaved}% saved</span>
                <span style={{ color: 'var(--text-main)' }}>₹{remaining.toLocaleString()} to go</span>
              </div>

              <button onClick={() => setDepositGoalId(goal.id)} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                <ArrowDownToLine size={16} />
                Deposit Savings
              </button>
            </motion.div>
          );
        })}
        {filteredGoals.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No savings goals found for {activeTab}. Create one to start saving!</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}>
              <div className="modal-header">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create New Goal</h2>
                <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Goal Name</label>
                  <input required type="text" className="form-input" placeholder="e.g. New Laptop" value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Target Amount (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                    <input required type="number" step="0.01" min="0" className="form-input" style={{ paddingLeft: '2.5rem', fontFamily: '"JetBrains Mono", monospace' }} placeholder="0.00" value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Owner</label>
                  <select className="form-input" value={newGoalOwner} onChange={(e) => setNewGoalOwner(e.target.value)}>
                    <option value="Joint">Joint (Shared)</option>
                    <option value="Rudra Patel">Rudra Patel</option>
                    <option value="Girishbhai Patel">Girishbhai Patel</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>Create Goal</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {depositGoalId && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}>
              <div className="modal-header">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Deposit Savings</h2>
                <button className="modal-close" onClick={() => setDepositGoalId(null)}>
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Amount to Deposit (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                    <input required type="number" step="0.01" min="0" max={availableBalance} className="form-input" style={{ paddingLeft: '2.5rem', fontFamily: '"JetBrains Mono", monospace' }} placeholder="0.00" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Available balance: ₹{availableBalance.toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn" onClick={() => setDepositGoalId(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>Deposit</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
