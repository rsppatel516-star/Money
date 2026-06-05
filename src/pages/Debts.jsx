import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, X } from 'lucide-react';
import { useStore } from '../store/useStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Debts() {
  const debts = useStore(state => state.debts) || [];
  const addDebt = useStore(state => state.addDebt);
  const removeDebt = useStore(state => state.removeDebt);
  const recordDebtPayment = useStore(state => state.recordDebtPayment);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDebtName, setNewDebtName] = useState('');
  const [newDebtTotal, setNewDebtTotal] = useState('');
  const [newDebtInterest, setNewDebtInterest] = useState('');
  const [newDebtEmi, setNewDebtEmi] = useState('');

  const [paymentDebtId, setPaymentDebtId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const handleAddDebt = (e) => {
    e.preventDefault();
    if (newDebtName && newDebtTotal && newDebtInterest && newDebtEmi) {
      addDebt({
        id: Date.now(),
        name: newDebtName,
        interest: parseFloat(newDebtInterest),
        total: parseFloat(newDebtTotal),
        outstanding: parseFloat(newDebtTotal),
        repaid: 0,
        emi: parseFloat(newDebtEmi)
      });
      setIsAddModalOpen(false);
      setNewDebtName('');
      setNewDebtTotal('');
      setNewDebtInterest('');
      setNewDebtEmi('');
    }
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (paymentDebtId && paymentAmount) {
      recordDebtPayment(paymentDebtId, parseFloat(paymentAmount));
      setPaymentDebtId(null);
      setPaymentAmount('');
    }
  };
  
  const totalOutstanding = debts.reduce((acc, d) => acc + d.outstanding, 0);
  const totalSettled = debts.reduce((acc, d) => acc + d.repaid, 0);
  const totalLoanBase = debts.reduce((acc, d) => acc + d.total, 0);
  const settlementProgress = totalLoanBase > 0 ? Math.round((totalSettled / totalLoanBase) * 100) : 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ color: '#8b5cf6', margin: 0 }}>Loans & Debt Repayments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '800px', marginTop: '0.5rem' }}>
            Track active mortgages, credit card lines, and private loans.
          </p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)' }}>
          <Plus size={18} />
          Add Debt Line
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <motion.div variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Outstanding Debt</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444', marginBottom: '0.25rem' }}>₹{totalOutstanding.toLocaleString()}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Remaining balance left to settle.</p>
        </motion.div>

        <motion.div variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Settled (Paid)</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginBottom: '0.25rem' }}>₹{totalSettled.toLocaleString()}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Accumulated repayment logs across entries.</p>
        </motion.div>

        <motion.div variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Settlement Progress</p>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>{settlementProgress}% Paid</h3>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', backgroundColor: '#10b981', width: `${settlementProgress}%`, borderRadius: '4px' }}></div>
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {debts.map(debt => {
          const percentPaid = Math.round((debt.repaid / debt.total) * 100);

          return (
            <motion.div key={debt.id} variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'relative' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem 0' }}>{debt.name}</h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6', backgroundColor: '#8b5cf615', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>{debt.interest}% Interest Rate</span>
                </div>
                <button onClick={() => removeDebt(debt.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }} title="Delete Debt">
                  <Trash2 size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.25rem' }}>Outstanding</div>
                  <div style={{ fontWeight: 800, color: '#111827', fontSize: '1.25rem' }}>₹{debt.outstanding.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.25rem' }}>Total Loan</div>
                  <div style={{ fontWeight: 600, color: '#6b7280', fontSize: '1.1rem' }}>₹{debt.total.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Repaid: <span style={{ color: '#8b5cf6' }}>₹{debt.repaid.toLocaleString()}</span></span>
                <span style={{ color: 'var(--text-muted)' }}>{percentPaid}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div style={{ height: '100%', backgroundColor: '#8b5cf6', width: `${percentPaid}%`, borderRadius: '3px' }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Monthly EMI</div>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>₹{debt.emi.toLocaleString()} / mo</div>
                </div>
                <button onClick={() => setPaymentDebtId(debt.id)} style={{ padding: '0.6rem 1rem', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem', color: '#8b5cf6', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background-color 0.2s' }}>
                  <CheckCircle2 size={16} />
                  Record Payment
                </button>
              </div>

            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}>
              <div className="modal-header">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Add New Debt</h2>
                <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddDebt} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Debt Name</label>
                  <input required type="text" className="form-input" placeholder="e.g. Car Loan" value={newDebtName} onChange={(e) => setNewDebtName(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Total Amount (₹)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                      <input required type="number" step="0.01" min="0" className="form-input" style={{ paddingLeft: '2.5rem', fontFamily: '"JetBrains Mono", monospace' }} placeholder="0.00" value={newDebtTotal} onChange={(e) => setNewDebtTotal(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Interest Rate (%)</label>
                    <input required type="number" step="0.01" min="0" className="form-input" placeholder="8.5" value={newDebtInterest} onChange={(e) => setNewDebtInterest(e.target.value)} />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Monthly EMI (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                    <input required type="number" step="0.01" min="0" className="form-input" style={{ paddingLeft: '2.5rem', fontFamily: '"JetBrains Mono", monospace' }} placeholder="0.00" value={newDebtEmi} onChange={(e) => setNewDebtEmi(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>Add Debt</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {paymentDebtId && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}>
              <div className="modal-header">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Record Payment</h2>
                <button className="modal-close" onClick={() => setPaymentDebtId(null)}>
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Payment Amount (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                    <input required type="number" step="0.01" min="0" className="form-input" style={{ paddingLeft: '2.5rem', fontFamily: '"JetBrains Mono", monospace' }} placeholder="0.00" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn" onClick={() => setPaymentDebtId(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>Record Payment</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
