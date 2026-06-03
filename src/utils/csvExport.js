/* eslint-disable */
/**
 * Utility to download transaction list as CSV format
 */
export const exportToCSV = (transactions, filename = 'moneyflow_transactions.csv') => {
  if (transactions.length === 0) return;

  const headers = ['ID', 'Type', 'Amount', 'Category', 'Date', 'Note'];
  
  const rows = transactions.map(t => [
    t.id,
    t.type,
    t.amount,
    t.category,
    t.date,
    t.note || ''
  ]);

  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
