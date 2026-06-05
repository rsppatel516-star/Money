import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Download, Filter, FileText, Calendar, DollarSign, PieChart as PieChartIcon, BarChart as BarChartIcon, TrendingUp, TrendingDown, Wallet, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function CustomDropdown({ icon: Icon, value, options, onChange }) {
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

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--panel-bg)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', minWidth: '150px', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {Icon && <Icon size={16} style={{ color: 'var(--text-muted)' }} />}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{selectedOption?.label || value}</span>
        </div>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
      </div>
      
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.25rem', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', zIndex: 50, overflow: 'hidden' }}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                color: opt.value === value ? 'var(--primary)' : 'var(--text-main)',
                backgroundColor: opt.value === value ? 'var(--primary-light)' : 'transparent',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (opt.value !== value) e.target.style.backgroundColor = 'var(--panel-bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (opt.value !== value) e.target.style.backgroundColor = 'transparent';
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Reports() {
  const transactions = useStore(state => state.transactions);
  const settings = useStore(state => state.settings);
  const currency = settings?.currency || 'INR';
  
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'this_month', 'last_month'
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = ['all', ...new Set(transactions.map(t => t.category))];

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const txDate = new Date(t.date);
      const now = new Date();
      let dateMatch = true;
      
      if (dateFilter === 'this_month') {
        dateMatch = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'last_month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        dateMatch = txDate.getMonth() === lastMonth.getMonth() && txDate.getFullYear() === lastMonth.getFullYear();
      }

      const catMatch = categoryFilter === 'all' || t.category === categoryFilter;

      return dateMatch && catMatch;
    });
  }, [transactions, dateFilter, categoryFilter]);

  const totalIncome = filteredTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const netTotal = totalIncome - totalExpense;

  const pieData = useMemo(() => {
    const expenseTxs = filteredTransactions.filter(t => t.amount < 0);
    const categoryTotals = {};
    expenseTxs.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.keys(categoryTotals).map(key => ({
      name: key,
      value: categoryTotals[key]
    })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#6366f1'];

  const barData = useMemo(() => {
    return [
      { name: 'Income', amount: totalIncome, fill: 'var(--success)' },
      { name: 'Expense', amount: totalExpense, fill: 'var(--danger)' }
    ];
  }, [totalIncome, totalExpense]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    const primaryColor = [139, 92, 246]; // #8b5cf6
    const textColor = [51, 51, 51];
    const lightGray = [243, 244, 246];

    // Document Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text('MoneyFlow', 14, 16);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text('Financial Report', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 16);

    // Reset Text Color
    doc.setTextColor(...textColor);

    // Report Details Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('Report Summary', 14, 40);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const periodText = dateFilter === 'all' ? 'All Time' : dateFilter === 'this_month' ? 'This Month' : 'Last Month';
    const catText = categoryFilter === 'all' ? 'All Categories' : categoryFilter;
    
    // Summary Cards (drawn as light grey boxes)
    doc.setFillColor(...lightGray);
    doc.roundedRect(14, 45, 88, 25, 3, 3, 'F');
    doc.roundedRect(108, 45, 88, 25, 3, 3, 'F');

    doc.setFont("helvetica", "bold");
    doc.text('Filters Applied', 18, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Period: ${periodText}`, 18, 59);
    doc.text(`Category: ${catText}`, 18, 65);

    doc.setFont("helvetica", "bold");
    doc.text('Financial Overview', 112, 52);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(16, 185, 129); // Success Green
    doc.text(`Income: ${currency} ${totalIncome.toLocaleString()}`, 112, 59);
    doc.setTextColor(239, 68, 68); // Danger Red
    doc.text(`Expense: ${currency} ${totalExpense.toLocaleString()}`, 112, 65);
    doc.setTextColor(...primaryColor); // Net Primary
    doc.setFont("helvetica", "bold");
    doc.text(`Net Total: ${currency} ${netTotal.toLocaleString()}`, 155, 65);

    // Reset text color for table
    doc.setTextColor(...textColor);

    // Add table
    const tableColumn = ["Date", "Name", "Category", "Method", "User", "Amount"];
    const tableRows = [];

    filteredTransactions.forEach(t => {
      const rowData = [
        t.date,
        t.name,
        t.category,
        t.paymentMethod || '-',
        t.user || '-',
        `${t.amount > 0 ? '+' : '-'}${currency} ${Math.abs(t.amount).toLocaleString()}`
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'grid',
      styles: { 
        fontSize: 9,
        font: 'helvetica',
        cellPadding: 4,
        lineColor: [229, 231, 235],
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        5: { halign: 'right', fontStyle: 'bold' }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 5) {
          if (data.cell.raw.includes('+')) {
            data.cell.styles.textColor = [16, 185, 129]; // Green
          } else if (data.cell.raw.includes('-')) {
            data.cell.styles.textColor = [239, 68, 68]; // Red
          }
        }
      },
      margin: { top: 80, right: 14, bottom: 20, left: 14 },
    });

    // Footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`moneyflow_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="dashboard">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Financial Reports</h1>
          <p className="subtitle" style={{ color: 'var(--text-muted)' }}>Generate and download custom transaction reports</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <CustomDropdown 
            icon={Calendar}
            value={dateFilter}
            onChange={setDateFilter}
            options={[
              { value: 'all', label: 'All Time' },
              { value: 'this_month', label: 'This Month' },
              { value: 'last_month', label: 'Last Month' }
            ]}
          />

          <CustomDropdown 
            icon={Filter}
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories.map(cat => ({
              value: cat,
              label: cat === 'all' ? 'All Categories' : cat
            }))}
          />

          <button className="btn btn-primary" onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Summary Metrics */}
        <div className="grid-cards">
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="card-header">
              <span className="card-title">Total Income</span>
              <div className="card-icon"><TrendingUp size={20} className="text-success" /></div>
            </div>
            <div className="card-value" style={{ color: 'var(--success)' }}>
              {currency} {totalIncome.toLocaleString()}
            </div>
          </motion.div>

          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card-header">
              <span className="card-title">Total Expense</span>
              <div className="card-icon"><TrendingDown size={20} className="text-danger" /></div>
            </div>
            <div className="card-value" style={{ color: 'var(--danger)' }}>
              {currency} {totalExpense.toLocaleString()}
            </div>
          </motion.div>

          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card-header">
              <span className="card-title">Net Balance</span>
              <div className="card-icon"><Wallet size={20} className="text-primary" /></div>
            </div>
            <div className="card-value" style={{ color: netTotal >= 0 ? 'var(--text-main)' : 'var(--danger)' }}>
              {currency} {netTotal.toLocaleString()}
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PieChartIcon size={18} style={{ color: 'var(--primary)' }} />
                Expenses by Category
              </h3>
            </div>
            <div className="chart-container">
              {filteredTransactions.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '2rem' }}>No data to display.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-md)' }}
                      formatter={(value) => `${currency} ${value.toLocaleString()}`} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
          >
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChartIcon size={18} style={{ color: 'var(--primary)' }} />
                Income vs Expenses
              </h3>
            </div>
            <div className="chart-container">
              {filteredTransactions.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '2rem' }}>No data to display.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="var(--text-muted)" />
                    <YAxis axisLine={false} tickLine={false} stroke="var(--text-muted)" tickFormatter={(value) => `${value > 1000 ? (value/1000).toFixed(0) + 'k' : value}`} />
                    <Tooltip 
                      cursor={{ fill: 'var(--panel-bg-hover)' }} 
                      contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', borderRadius: 'var(--radius-md)' }}
                      formatter={(value) => `${currency} ${value.toLocaleString()}`} 
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} style={{ color: 'var(--primary)' }} />
              Transactions Included
            </h3>
          </div>
          
          <div className="list-container" style={{ marginTop: '1rem' }}>
            {filteredTransactions.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No transactions found for the selected filters.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Name</th>
                      <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Category</th>
                      <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Method</th>
                      <th style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.date}</td>
                        <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>{t.name}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <span style={{ padding: '0.25rem 0.6rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            {t.category}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.paymentMethod || '-'}</td>
                        <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: 700, fontSize: '1.05rem', color: t.amount > 0 ? 'var(--success)' : 'var(--text-main)' }}>
                          {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
