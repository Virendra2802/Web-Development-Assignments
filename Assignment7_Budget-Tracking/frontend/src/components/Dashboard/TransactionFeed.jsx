import { useState } from 'react';
import axios from 'axios';

const TransactionFeed = ({ transactions }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState('all');
  const itemsPerPage = 5;

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const storedUser = localStorage.getItem('axia_user');
      if (!storedUser) return;
      const user = JSON.parse(storedUser);
      const userId = user.id || user._id;

      await axios.delete(`http://localhost:5000/api/transactions/${id}?userId=${userId}`);
      // Fire custom event to refresh transactions in all components
      window.dispatchEvent(new Event('axia:transactions-updated'));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Failed to delete transaction.');
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filterCategory === 'all') return true;
    return tx.category.toLowerCase() === filterCategory.toLowerCase();
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const getCatClass = (cat) => {
    const map = {
      groceries: 'cat-groceries',
      rent: 'cat-rent',
      entertainment: 'cat-entertainment',
      dining: 'cat-food',
      transport: 'cat-transport',
      health: 'cat-health',
      shopping: 'cat-groceries',
      utilities: 'cat-rent'
    };
    return map[cat.toLowerCase()] || 'cat-food';
  };

  const handleExport = () => {
    const headers = ['Description', 'Category', 'Date', 'Amount', 'Confidence', 'Status'];
    const rows = filteredTransactions.map(tx => [
      tx.desc,
      tx.category,
      tx.date,
      tx.amount.replace('−', '-'),
      tx.confidence + '%',
      tx.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${filterCategory}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card card-transactions glassmorphism">
      <div className="card-header">
        <div>
          <div className="card-title">Transaction Intelligence Feed</div>
          <div className="card-subtitle">Powered by Axia AI • Real-time categorization</div>
        </div>
        <div className="tx-controls">
          <select 
            className="filter-select" 
            value={filterCategory} 
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Categories</option>
            <option value="groceries">🛒 Groceries</option>
            <option value="dining">🍽️ Dining</option>
            <option value="transport">🚗 Transport</option>
            <option value="entertainment">🎬 Entertainment</option>
            <option value="health">💊 Health</option>
            <option value="utilities">⚡ Utilities</option>
            <option value="shopping">🛍️ Shopping</option>
          </select>
          <button className="icon-btn" onClick={handleExport}>⤓ Export</button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="tx-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th className="sortable">Date ↕</th>
              <th>Amount</th>
              <th>AI Insight</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((tx, idx) => (
              <tr key={tx._id || idx}>
                <td>{tx.desc}</td>
                <td><span className={`tx-category ${getCatClass(tx.category)}`}>{tx.category}</span></td>
                <td>{tx.date}</td>
                <td className={`tx-amount ${tx.type === 'credit' ? 'credit' : 'debit'}`}>{tx.amount}</td>
                <td>
                  <div className="confidence-bar-wrap">
                    <div className="confidence-bar">
                      <div className="confidence-fill" style={{ width: `${tx.confidence}%` }}></div>
                    </div>
                    <span className="confidence-val">{tx.confidence}%</span>
                  </div>
                </td>
                <td><span className={`status-badge status-${tx.status.toLowerCase()}`}>{tx.status}</span></td>
                <td>
                  <button 
                    className="icon-btn delete-btn" 
                    onClick={() => handleDelete(tx._id)}
                    title="Delete Transaction"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '5px' }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {currentTransactions.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No transactions found for this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="tx-pagination">
        <button 
          className="page-btn" 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          ← Prev
        </button>
        <span className="page-info">Page {currentPage} of {totalPages || 1}</span>
        <button 
          className="page-btn" 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default TransactionFeed;
