import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useUI } from '../context/UIContext';
import axios from 'axios';

const Sidebar = ({ user }) => {
  const location = useLocation();
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState('');
  const { openExpenseModal } = useUI();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '⬡' },
    { path: '/budgets', label: 'Budgets', icon: '📊' },
    { path: '/investments', label: 'Investments', icon: '📈' },
    { path: '/profile', label: 'Profile & Settings', icon: '👤' },
  ];

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AR';
  };

  const handleQuickSave = async () => {
    if (!quickAmount || !quickCategory) return;
    
    try {
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

      const newTx = {
        userId: user.id || user._id,
        desc: 'Quick Expense',
        category: quickCategory,
        catClass: getCatClass(quickCategory),
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/'),
        amount: `−₹ ${parseFloat(quickAmount).toLocaleString('en-IN')}`,
        type: 'debit',
        confidence: 95,
        status: 'pending'
      };

      await axios.post('http://localhost:5000/api/transactions', newTx);
      setQuickAmount('');
      setQuickCategory('');
      setQuickOpen(false);
      // Fire a lightweight custom event instead of full page reload
      window.dispatchEvent(new Event('axia:transactions-updated'));
    } catch (err) {
      console.error('Quick Save Error:', err);
    }
  };

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">A</div>
        <span className="logo-text">Axia Finance</span>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                <span className="nav-indicator"></span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-add-btn-wrap">
        <button className="btn-add-expense" onClick={openExpenseModal}>
          <span className="add-icon">➕</span>
          <span>Add Expense</span>
        </button>
      </div>

      <div className="quick-add-panel">
        <div className="quick-add-header" onClick={() => setQuickOpen(!quickOpen)}>
          <span>⚡ Quick Add</span>
          <span className={`chevron ${quickOpen ? 'open' : ''}`}>▾</span>
        </div>
        {quickOpen && (
          <div className="quick-add-body">
            <div className="quick-add-row">
              <input 
                type="number" 
                className="quick-input" 
                placeholder="₹ Amount" 
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
              />
              <select 
                className="quick-select"
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value)}
              >
                <option value="">Category</option>
                <option value="Groceries">🛒 Groceries</option>
                <option value="Dining">🍽️ Dining</option>
                <option value="Transport">🚗 Transport</option>
                <option value="Entertainment">🎬 Entertainment</option>
              </select>
            </div>
            <button className="btn-quick-save" onClick={handleQuickSave}>Save →</button>
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{getInitials(user.name)}</div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">Premium Member</span>
          </div>
          <span className="chevron-right">›</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
