import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Info, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Budget() {
  const budgets = useStore(state => state.budgets) || [];

  const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const overallConsumedPercent = totalBudgetLimit > 0 ? Math.min(100, Math.round((totalSpent / totalBudgetLimit) * 100)) : 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '800px' }}>
          Establish spending limits per category, track progress, and configure alerts.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <motion.div variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Budget Limit</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>₹{totalBudgetLimit.toLocaleString()}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sum of all active category allocations</p>
        </motion.div>

        <motion.div variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Budget Status</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={24} /> All Safe
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current month parameters</p>
        </motion.div>

        <motion.div variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Budget Consumed</p>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{overallConsumedPercent}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden', marginTop: '1rem' }}>
            <div style={{ height: '100%', backgroundColor: '#8b5cf6', width: `${overallConsumedPercent}%`, borderRadius: '4px' }}></div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} style={{ backgroundColor: '#f3f4f6', borderRadius: '0.75rem', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid #e5e7eb' }}>
        <Info size={20} color="#8b5cf6" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          You can modify your budgets by clicking the edit icon on the cards. Budgets with a limit of 0 or left unconfigured will not trigger spending warnings.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {budgets.map(budget => {
          const isConfigured = budget.limit > 0;
          const percentUsed = isConfigured ? Math.min(100, Math.round((budget.spent / budget.limit) * 100)) : 0;
          const remaining = isConfigured ? Math.max(0, budget.limit - budget.spent) : 0;

          return (
            <motion.div key={budget.id} variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'relative' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', backgroundColor: `${budget.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                    {budget.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>{budget.category}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Budget Category</span>
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Edit Budget">
                  <Edit3 size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--text-muted)' }}>Spent:</span> <span style={{ fontWeight: 600, color: '#111827' }}>₹{budget.spent.toLocaleString()}</span></div>
                <div style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--text-muted)' }}>Budget:</span> <span style={{ fontWeight: 600, color: isConfigured ? '#111827' : 'var(--text-muted)' }}>{isConfigured ? `₹${budget.limit.toLocaleString()}` : 'Not Set'}</span></div>
              </div>

              {isConfigured ? (
                <>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', margin: '0.75rem 0' }}>
                    <div style={{ height: '100%', backgroundColor: budget.color, width: `${percentUsed}%`, borderRadius: '3px' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{percentUsed}% Used</span>
                    <span style={{ color: '#111827' }}>₹{remaining.toLocaleString()} remaining</span>
                  </div>
                </>
              ) : (
                <button style={{ width: '100%', padding: '0.75rem', marginTop: '0.75rem', backgroundColor: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '0.5rem', color: '#8b5cf6', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  Set Spending Limit
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

    </motion.div>
  );
}
