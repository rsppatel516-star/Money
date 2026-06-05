import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';

// Custom Dropdown for Subscriptions
const CustomDropdown = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        className="form-input" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-color)', color: value ? 'var(--text-main)' : 'var(--text-muted)' }}
      >
        <span>{value || placeholder}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} color="var(--text-muted)" />
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', zIndex: 50, maxHeight: '200px', overflowY: 'auto' }}
          >
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                style={{ padding: '0.75rem 1rem', cursor: 'pointer', color: value === opt ? 'var(--primary)' : 'var(--text-main)', fontWeight: value === opt ? 600 : 400, backgroundColor: value === opt ? 'var(--primary-light)' : 'transparent', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => { if(value !== opt) e.target.style.backgroundColor = 'var(--panel-bg-hover)'; }}
                onMouseLeave={(e) => { if(value !== opt) e.target.style.backgroundColor = 'transparent'; }}
              >
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Subscriptions() {
  const subscriptions = useStore(state => state.subscriptions);
  const addSubscription = useStore(state => state.addSubscription);
  const removeSubscription = useStore(state => state.removeSubscription);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newCycle, setNewCycle] = useState('Monthly');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddSubscription = (e) => {
    e.preventDefault();
    if (!newName || !newCost || !newCycle || !newDate) return;

    const newSub = {
      id: Date.now(),
      name: newName,
      cost: parseFloat(newCost),
      cycle: newCycle,
      nextPayment: newDate,
      icon: '🔄' // Default icon for new subs
    };

    addSubscription(newSub);
    setIsModalOpen(false);
    setNewName('');
    setNewCost('');
    setNewCycle('Monthly');
    setNewDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Subscriptions</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your recurring expenses.</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>Add Subscription</span>
        </motion.button>
      </div>
      
      <div className="grid-cards">
        {subscriptions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No active subscriptions.</p>
        ) : (
          subscriptions.map(sub => {
            // Calculate fake progress bar based on date
            const daysUntil = Math.max(0, Math.floor((new Date(sub.nextPayment) - new Date()) / (1000 * 60 * 60 * 24)));
            const cycleDays = sub.cycle === 'Monthly' ? 30 : 365;
            const progress = Math.min(100, Math.max(0, 100 - (daysUntil / cycleDays) * 100));

            return (
              <motion.div key={sub.id} variants={itemVariants} className="card" style={{ position: 'relative' }}>
                <button 
                  onClick={() => removeSubscription(sub.id)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
                  className="hover-bg-danger"
                >
                  <Trash2 size={18} />
                </button>
                <div className="card-header">
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{fontSize: '1.5rem'}}>{sub.icon}</span>
                    <span className="card-title" style={{margin: 0}}>{sub.name}</span>
                  </div>
                  <span style={{padding: '0.25rem 0.5rem', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, marginRight: '2.5rem'}}>Active</span>
                </div>
                <div className="card-value" style={{ fontSize: '1.75rem', fontFamily: '"JetBrains Mono", monospace' }}>₹{sub.cost.toLocaleString()} <span style={{fontSize: '1rem', color: 'var(--text-muted)', fontFamily: '"Inter", sans-serif'}}>/ {sub.cycle === 'Monthly' ? 'mo' : 'yr'}</span></div>
                <div style={{ height: '4px', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-full)', marginTop: '1rem', marginBottom: '0.5rem', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--primary)' }}></div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Next payment: <span style={{ fontWeight: 600 }}>{new Date(sub.nextPayment).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </p>
              </motion.div>
            )
          })
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}>
              <div className="modal-header">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>New Subscription</h2>
                <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddSubscription} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Service Name</label>
                  <input required type="text" className="form-input" placeholder="e.g. Netflix, Spotify" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Cost (₹)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                      <input required type="number" step="0.01" min="0" className="form-input" style={{ paddingLeft: '2.5rem', fontFamily: '"JetBrains Mono", monospace' }} placeholder="0.00" value={newCost} onChange={(e) => setNewCost(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Billing Cycle</label>
                    <CustomDropdown 
                      value={newCycle} 
                      onChange={setNewCycle} 
                      placeholder="Select cycle"
                      options={['Monthly', 'Yearly']} 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                    <label className="form-label">Next Payment Date</label>
                    <input required type="date" className="form-input" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={{ cursor: 'pointer', fontFamily: '"JetBrains Mono", monospace' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>Add Subscription</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
