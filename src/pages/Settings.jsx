import React, { useState } from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export default function Settings() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [currency, setCurrency] = useState('INR');

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your preferences and account details.</p>
        </div>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: '1fr' }}>
        <motion.div variants={itemVariants} className="card">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <span className="card-title">Profile Information</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" defaultValue="Rudra Patel" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" defaultValue="rudra@example.com" />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              Save Changes
            </motion.button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <span className="card-title">Preferences</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-main)' }}>Email Notifications</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Receive daily transaction summaries.</p>
              </div>
              <div 
                onClick={() => setEmailNotif(!emailNotif)}
                style={{ width: '44px', height: '24px', backgroundColor: emailNotif ? 'var(--primary)' : 'var(--border-color)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background-color 0.3s' }}
              >
                <motion.div 
                  layout
                  initial={false}
                  animate={{ x: emailNotif ? 20 : 2 }}
                  transition={{ type: "spring", stiffness: 700, damping: 30 }}
                  style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-main)' }}>Currency</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Set your primary display currency.</p>
              </div>
              <select 
                className="form-input" 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                style={{ width: 'auto', minWidth: '120px', cursor: 'pointer' }}
              >
                <option value="INR">₹ (INR)</option>
                <option value="USD">$ (USD)</option>
                <option value="EUR">€ (EUR)</option>
              </select>
            </div>

          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
