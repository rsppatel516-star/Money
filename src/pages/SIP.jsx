import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LineChart, Trash2, X, ChevronDown, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Custom Select Component for "opart style"
function CustomSelect({ value, onChange, options, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="form-group" style={{ margin: 0 }} ref={dropdownRef}>
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="form-input" 
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', backgroundColor: 'var(--panel-bg)' }}
        >
          <span>{value}</span>
          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', zIndex: 50, overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            >
              {options.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => { onChange(option); setIsOpen(false); }}
                  style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: value === option ? 'var(--primary)' : 'transparent', color: value === option ? 'white' : 'var(--text-main)', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background-color 0.15s' }}
                  onMouseEnter={(e) => { if (value !== option) e.currentTarget.style.backgroundColor = 'var(--primary-light)'; }}
                  onMouseLeave={(e) => { if (value !== option) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span>{option}</span>
                  {value === option && <Check size={16} />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SIP() {
  const sips = useStore(state => state.sips) || [];
  const addSip = useStore(state => state.addSip);
  const removeSip = useStore(state => state.removeSip);
  const addTransaction = useStore(state => state.addTransaction);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSipName, setNewSipName] = useState('');
  const [newSipAmount, setNewSipAmount] = useState('');
  const [newSipOwner, setNewSipOwner] = useState('Rudra Patel');
  const [newSipDate, setNewSipDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSipNextDate, setNewSipNextDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });

  const handleAddSip = (e) => {
    e.preventDefault();
    if (newSipName && newSipAmount && newSipDate && newSipNextDate) {
      const amount = parseFloat(newSipAmount);
      
      // Save SIP entry
      addSip({
        id: Date.now(),
        name: newSipName,
        amount: amount,
        owner: newSipOwner,
        date: newSipDate,
        nextDate: newSipNextDate,
      });
      
      // Auto-add negative transaction for Dashboard sync
      addTransaction({
        id: Date.now() + 1,
        name: `SIP: ${newSipName}`,
        amount: -amount,
        category: 'Investment',
        date: newSipDate,
      });

      setIsAddModalOpen(false);
      setNewSipName('');
      setNewSipAmount('');
      setNewSipDate(new Date().toISOString().split('T')[0]);
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      setNewSipNextDate(d.toISOString().split('T')[0]);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Systematic Investment Plan</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and track your mutual fund SIPs.</p>
        </div>
        
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>New SIP</span>
        </button>
      </div>

      <motion.div variants={itemVariants} className="card">
        <div className="card-header">
          <span className="card-title">Active SIP Entries</span>
        </div>
        <div className="list-container">
          {sips.length > 0 ? (
            sips.map(sip => (
              <div key={sip.id} className="list-item">
                <div className="item-left">
                  <div className="item-icon" style={{ backgroundColor: 'var(--primary-light)' }}>
                    <LineChart size={18} className="text-primary" />
                  </div>
                  <div className="item-details">
                    <span className="item-name">{sip.name}</span>
                    <span className="item-category">Owner: {sip.owner}</span>
                  </div>
                </div>
                <div className="item-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span className="item-amount">₹{sip.amount.toLocaleString()}</span>
                    <span className="item-date">Next: {sip.nextDate || 'Monthly'}</span>
                  </div>
                  <button onClick={() => removeSip(sip.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)', padding: '2rem 1rem', textAlign: 'center' }}>No active SIPs found. Click 'New SIP' to add an entry.</p>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} style={{ maxWidth: '500px', width: '100%' }}>
              <div className="modal-header">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create New SIP Entry</h2>
                <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddSip} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">SIP Name (Fund)</label>
                  <input required type="text" className="form-input" placeholder="e.g. Nifty 50 Index Fund" value={newSipName} onChange={(e) => setNewSipName(e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Monthly Amount (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                    <input required type="number" step="100" min="500" className="form-input" style={{ paddingLeft: '2.5rem', fontFamily: '"JetBrains Mono", monospace' }} placeholder="5000" value={newSipAmount} onChange={(e) => setNewSipAmount(e.target.value)} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0, flex: 1 }}>
                    <label className="form-label">SIP Date</label>
                    <input required type="date" className="form-input" value={newSipDate} onChange={(e) => setNewSipDate(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0, flex: 1 }}>
                    <label className="form-label">Next SIP Date</label>
                    <input required type="date" className="form-input" value={newSipNextDate} onChange={(e) => setNewSipNextDate(e.target.value)} />
                  </div>
                </div>
                
                <CustomSelect 
                  label="Owner" 
                  value={newSipOwner} 
                  onChange={setNewSipOwner} 
                  options={['Rudra Patel', 'Girishbhai Patel']} 
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>Save SIP</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
