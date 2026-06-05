import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, X, Trash2, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';

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
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export default function Transactions() {
  const transactions = useStore(state => state.transactions);
  const addTransaction = useStore(state => state.addTransaction);
  const removeTransaction = useStore(state => state.removeTransaction);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState('expense');
  const [newCategory, setNewCategory] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPaymentMethod, setNewPaymentMethod] = useState('');

  const filteredTransactions = transactions.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!newName || !newAmount || !newCategory || !newDate || !newPaymentMethod) return;

    const amountValue = parseFloat(newAmount);
    const newTx = {
      id: Date.now(),
      name: newName,
      category: newCategory,
      amount: newType === 'expense' ? -Math.abs(amountValue) : Math.abs(amountValue),
      date: newDate,
      paymentMethod: newPaymentMethod,
      icon: newType === 'income' ? '💵' : '💸'
    };

    addTransaction(newTx);
    setIsModalOpen(false);
    setNewName('');
    setNewAmount('');
    setNewCategory('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewPaymentMethod('');
  };

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, item) => {
    const date = item.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="transactions">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Transactions</h1>
          <p style={{ color: 'var(--text-muted)' }}>View and manage your history.</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>Add Transaction</span>
        </motion.button>
      </div>

      <motion.div variants={itemVariants} className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, margin: 0, flexDirection: 'row', alignItems: 'center', backgroundColor: 'var(--panel-bg-hover)', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem' }}>
            <Search size={20} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search transactions by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none', marginLeft: '0.5rem' }}
            />
          </div>
          <button className="btn" style={{ border: '1px solid var(--border-color)' }}>
            <Filter size={20} />
            Filter
          </button>
        </div>

        <motion.div variants={containerVariants} className="list-container" style={{ gap: '2rem' }}>
          {sortedDates.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No transactions found.</p>
          ) : (
            sortedDates.map(date => (
              <div key={date}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {groupedTransactions[date].map(item => (
                    <motion.div variants={itemVariants} key={item.id} className="list-item" style={{ position: 'relative' }}>
                      <div className="item-left">
                        <div className="item-icon" style={{ fontSize: '1.5rem' }}>{item.icon}</div>
                        <div className="item-details">
                          <span className="item-name">{item.name}</span>
                          <span className="item-category" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {item.category}
                            {item.paymentMethod && (
                              <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', backgroundColor: 'var(--panel-bg-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 600 }}>
                                {item.paymentMethod}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="item-right" style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: '1rem' }}>
                        <span className="item-amount" style={{ color: item.amount > 0 ? 'var(--success)' : 'inherit', fontSize: '1.1rem' }}>
                          {item.amount > 0 ? '+' : ''}₹{Math.abs(item.amount).toLocaleString()}
                        </span>
                        <button onClick={() => removeTransaction(item.id)} style={{ color: 'var(--danger)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', transition: 'background-color 0.2s' }} className="hover-bg-danger">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}>
              <div className="modal-header">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>New Transaction</h2>
                <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Custom Segmented Control */}
                <div style={{ display: 'flex', backgroundColor: 'var(--panel-bg-hover)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
                  <div 
                    onClick={() => setNewType('expense')}
                    style={{ flex: 1, textAlign: 'center', padding: '0.75rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', backgroundColor: newType === 'expense' ? 'var(--bg-color)' : 'transparent', color: newType === 'expense' ? 'var(--danger)' : 'var(--text-muted)', boxShadow: newType === 'expense' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                  >
                    Expense
                  </div>
                  <div 
                    onClick={() => setNewType('income')}
                    style={{ flex: 1, textAlign: 'center', padding: '0.75rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', backgroundColor: newType === 'income' ? 'var(--bg-color)' : 'transparent', color: newType === 'income' ? 'var(--success)' : 'var(--text-muted)', boxShadow: newType === 'income' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
                  >
                    Income
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Transaction Name</label>
                  <input required type="text" className="form-input" placeholder="e.g. Uber, Coffee, Salary" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Amount (₹)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                      <input required type="number" step="0.01" min="0" className="form-input" style={{ paddingLeft: '2.5rem', fontFamily: '"JetBrains Mono", monospace' }} placeholder="0.00" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Category</label>
                    <CustomDropdown 
                      value={newCategory} 
                      onChange={setNewCategory} 
                      placeholder="Select category"
                      options={newType === 'expense' ? [
                        "Food & Dining", "Transport", "Utilities", "Shopping", "Entertainment", "Health", "Other Expense"
                      ] : [
                        "Salary", "Freelance", "Investments", "Gifts", "Other Income"
                      ]} 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Date</label>
                    <input required type="date" className="form-input" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={{ cursor: 'pointer', fontFamily: '"JetBrains Mono", monospace' }} />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Payment Method</label>
                    <CustomDropdown 
                      value={newPaymentMethod} 
                      onChange={setNewPaymentMethod} 
                      placeholder="Select method"
                      options={["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash"]} 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>Save Transaction</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
