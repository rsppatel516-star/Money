import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, Wallet, TrendingUp, ActivitySquare } from 'lucide-react';
import { useStore } from '../store/useStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Insights() {
  const { aiMessages = [], addAiMessage } = useStore();
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  const quickActions = [
    'Suggest Budget Cuts',
    'Evaluate Savings Goals',
    'Check Recurring Subscriptions',
    'General Savings Tip'
  ];

  const handleSend = (text = inputText) => {
    if (!text.trim()) return;

    // Add user message
    addAiMessage({
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      addAiMessage({
        id: Date.now() + 1,
        sender: 'ai',
        text: `I've received your request about "${text}". Based on your current data, your financial health is stable. I recommend reviewing your entertainment budget as it has room for optimization.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 1000);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem', height: 'calc(100vh - 100px)' }}>
      
      <div style={{ display: 'flex', gap: '2rem', height: '100%' }}>
        
        {/* Left Column: Automated Insights */}
        <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.5rem' }}>AI Financial Insights</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Automated recommendations based on real-time balance calculations.
            </p>
          </div>

          <motion.div variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#8b5cf6', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wallet size={16} /> Savings Ratio Status
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              🎉 Great job! You are saving <strong>64%</strong> of your total earnings this month.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#8b5cf6', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} /> Monthly Bill Projections
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              You have 4 recurring billing systems. Total projected monthly recurring expense is <strong style={{ color: '#8b5cf6' }}>₹4,694</strong>. Ensure these plans are fully utilized.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ef4444', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ActivitySquare size={16} /> Active EMI Obligations
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Your monthly EMI payments total <strong style={{ color: '#ef4444' }}>₹25,500</strong>. Settle outstanding principal balances systematically to avoid compounding interest costs.
            </p>
          </motion.div>
        </div>

        {/* Right Column: Chat Interface */}
        <motion.div variants={itemVariants} style={{ flex: 1, backgroundColor: 'white', borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Chat Header */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#8b5cf6', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Bot size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Financial Advisor Coach
                <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Powered by Live Ledger Records</p>
            </div>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {aiMessages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: '1rem', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                {msg.sender === 'ai' && (
                  <div style={{ width: '32px', height: '32px', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', flexShrink: 0 }}>
                    <Bot size={18} />
                  </div>
                )}
                <div>
                  <div style={{ backgroundColor: msg.sender === 'user' ? '#8b5cf6' : 'white', color: msg.sender === 'user' ? 'white' : '#111827', padding: '1rem', borderRadius: '1rem', border: msg.sender === 'user' ? 'none' : '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions & Input */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {quickActions.map(action => (
                <button 
                  key={action}
                  onClick={() => handleSend(action)}
                  style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500 }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.color = '#8b5cf6'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {action} ›
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Ask your AI Coach (e.g. Suggest budget cuts)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                style={{ flex: 1, padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem', outline: 'none', fontSize: '0.9rem' }}
              />
              <button 
                onClick={() => handleSend()}
                style={{ width: '48px', height: '48px', backgroundColor: '#8b5cf6', border: 'none', borderRadius: '0.75rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'background-color 0.2s' }}
              >
                <Send size={20} />
              </button>
            </div>
          </div>

        </motion.div>
      </div>

    </motion.div>
  );
}
