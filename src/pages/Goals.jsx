import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ArrowDownToLine, Info } from 'lucide-react';
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
  
  // Calculate a mock "available balance"
  const availableBalance = 60800;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ color: '#8b5cf6', margin: 0 }}>Savings Goals</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '800px', marginTop: '0.5rem' }}>
            Create targets for emergency funds or major purchases and allocate spare balance.
          </p>
        </div>
        <button style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)' }}>
          <Plus size={18} />
          Create Goal
        </button>
      </div>

      <motion.div variants={itemVariants} style={{ backgroundColor: '#f3f4f6', borderRadius: '0.75rem', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid #e5e7eb', color: '#8b5cf6' }}>
        <Info size={20} style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.85rem', margin: 0 }}>
          You have <strong>₹{availableBalance.toLocaleString()}</strong> available in your current balance. Depositing funds into goals acts as a savings allocation that adjusts your dashboard cash balance.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {goals.map(goal => {
          const percentSaved = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const remaining = Math.max(0, goal.target - goal.current);

          return (
            <motion.div key={goal.id} variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'relative' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', backgroundColor: `${goal.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                    {goal.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>{goal.name}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Savings Target</span>
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Delete Goal">
                  <Trash2 size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--text-muted)' }}>Saved:</span> <span style={{ fontWeight: 600, color: '#111827' }}>₹{goal.current.toLocaleString()}</span></div>
                <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--text-muted)' }}>Target:</span> <span style={{ fontWeight: 600, color: '#111827' }}>₹{goal.target.toLocaleString()}</span></div>
              </div>

              <div style={{ width: '100%', height: '8px', backgroundColor: '#4b5563', borderRadius: '4px', overflow: 'hidden', margin: '0.75rem 0' }}>
                <div style={{ height: '100%', backgroundColor: goal.color, width: `${percentSaved}%`, borderRadius: '4px' }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                <span style={{ color: goal.color }}>{percentSaved}% saved</span>
                <span style={{ color: '#111827' }}>₹{remaining.toLocaleString()} to go</span>
              </div>

              <button style={{ width: '100%', padding: '0.75rem', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', color: '#8b5cf6', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background-color 0.2s' }}>
                <ArrowDownToLine size={16} />
                Deposit Savings
              </button>
            </motion.div>
          );
        })}
      </div>

    </motion.div>
  );
}
