import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
};

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isNewNumber, setIsNewNumber] = useState(true);

  const handleNumber = useCallback((num) => {
    if (isNewNumber) {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  }, [display, isNewNumber]);

  const handleOperator = useCallback((op) => {
    setEquation(display + ' ' + op + ' ');
    setIsNewNumber(true);
  }, [display]);

  const calculate = useCallback(() => {
    if (!equation) return;
    try {
      // Evaluate equation safely
      // We only allow basic math characters to prevent injection
      const sanitized = (equation + display).replace(/[^-()\d/*+.]/g, '');
      const result = new Function('return ' + sanitized)();
      setDisplay(String(result));
      setEquation('');
      setIsNewNumber(true);
    } catch (e) {
      setDisplay('Error');
      setEquation('');
      setIsNewNumber(true);
    }
  }, [equation, display]);

  const clear = useCallback(() => {
    setDisplay('0');
    setEquation('');
    setIsNewNumber(true);
  }, []);

  const handleKeyDown = useCallback((e) => {
    const { key } = e;
    if (/[0-9]/.test(key)) {
      handleNumber(key);
    } else if (['+', '-', '*', '/'].includes(key)) {
      handleOperator(key);
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      calculate();
    } else if (key === 'Escape' || key === 'Backspace') {
      clear();
    } else if (key === '.') {
      if (!display.includes('.')) handleNumber('.');
    }
  }, [handleNumber, handleOperator, calculate, clear, display]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const buttonStyle = {
    padding: '1.25rem',
    fontSize: '1.25rem',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-color)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  };

  const opStyle = {
    ...buttonStyle,
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    borderColor: 'var(--primary-light)'
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
      <div className="page-header" style={{ width: '100%', maxWidth: '400px', alignSelf: 'center' }}>
        <div>
          <h1 className="page-title">Calculator</h1>
          <p style={{ color: 'var(--text-muted)' }}>Use your keyboard or click below.</p>
        </div>
      </div>

      <motion.div variants={itemVariants} className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'right', border: '1px solid var(--border-color)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', minHeight: '1.5rem', marginBottom: '0.5rem' }}>
            {equation}
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {display}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{...buttonStyle, gridColumn: 'span 2', backgroundColor: 'var(--danger-light)', color: 'var(--danger)'}} onClick={clear}>AC</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={opStyle} onClick={() => handleOperator('/')}>÷</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={opStyle} onClick={() => handleOperator('*')}>×</motion.button>
          
          {[7, 8, 9].map(num => (
            <motion.button key={num} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={buttonStyle} onClick={() => handleNumber(String(num))}>{num}</motion.button>
          ))}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={opStyle} onClick={() => handleOperator('-')}>−</motion.button>
          
          {[4, 5, 6].map(num => (
            <motion.button key={num} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={buttonStyle} onClick={() => handleNumber(String(num))}>{num}</motion.button>
          ))}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={opStyle} onClick={() => handleOperator('+')}>+</motion.button>
          
          {[1, 2, 3].map(num => (
            <motion.button key={num} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={buttonStyle} onClick={() => handleNumber(String(num))}>{num}</motion.button>
          ))}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{...opStyle, gridRow: 'span 2', backgroundColor: 'var(--primary)', color: 'white'}} onClick={calculate}>=</motion.button>
          
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{...buttonStyle, gridColumn: 'span 2'}} onClick={() => handleNumber('0')}>0</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={buttonStyle} onClick={() => handleNumber('.')}>.</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
