/* eslint-disable */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Utility to generate a PDF statement using jsPDF
 */
export const exportToPDF = (transactions, user, metrics, settings) => {
  if (transactions.length === 0) return;

  const doc = new jsPDF();
  const currencySym = settings.currency === 'INR' ? 'Rs' : settings.currency === 'USD' ? '$' : 'EUR';

  // --- Header Styling ---
  doc.setFillColor(99, 102, 241); // Indigo color
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('MONEYFLOW', 15, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Smart Expense & Budget Tracker Statement', 15, 32);

  // --- Document Info ---
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('User Profile:', 15, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${user?.displayName || 'Demo User'}`, 15, 55);
  doc.text(`Email: ${user?.email || 'N/A'}`, 15, 60);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Statement Info:', 130, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 130, 55);
  doc.text(`Currency: ${settings.currency}`, 130, 60);

  // --- Summary Box ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 68, 180, 24, 3, 3, 'F');
  
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('TOTAL INCOME', 25, 75);
  doc.text('TOTAL EXPENSE', 85, 75);
  doc.text('NET SAVINGS', 145, 75);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`${currencySym} ${metrics.income.toLocaleString()}`, 25, 83);
  doc.text(`${currencySym} ${metrics.expenses.toLocaleString()}`, 85, 83);
  doc.text(`${currencySym} ${metrics.balance.toLocaleString()}`, 145, 83);

  // --- Table of Transactions ---
  const tableColumn = ['Date', 'Category', 'Description/Note', 'Type', 'Amount'];
  const tableRows = [];

  transactions.forEach(t => {
    const transactionData = [
      t.date,
      t.category,
      t.note || '-',
      t.type.toUpperCase(),
      `${t.type === 'expense' ? '-' : '+'} ${currencySym} ${t.amount.toLocaleString()}`
    ];
    tableRows.push(transactionData);
  });

  doc.setFontSize(12);
  doc.text('Transaction Details', 15, 103);

  doc.autoTable({
    startY: 107,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: [99, 102, 241], 
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: { 
      fontSize: 8 
    },
    columnStyles: {
      3: { fontStyle: 'bold' },
      4: { fontStyle: 'bold', halign: 'right' }
    },
    // Row color styling based on type (Income vs Expense)
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 3) {
        if (data.cell.raw.startsWith('INC')) {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald Green
        } else {
          data.cell.styles.textColor = [244, 63, 94]; // Rose Red
        }
      }
      if (data.section === 'body' && data.column.index === 4) {
        if (data.row.cells[3].raw.startsWith('INC')) {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [244, 63, 94];
        }
      }
    }
  });

  // Save the PDF
  const nameSafe = (user?.displayName || 'User').replace(/\s+/g, '_').toLowerCase();
  doc.save(`moneyflow_${nameSafe}_statement.pdf`);
};
