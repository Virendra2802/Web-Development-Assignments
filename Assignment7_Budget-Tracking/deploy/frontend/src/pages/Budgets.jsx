import { useState, useEffect } from 'react';
import { useUI } from '../context/UIContext';
import useTransactions from '../hooks/useTransactions';

const Budgets = ({ user }) => {
  const [budgets, setBudgets] = useState({});
  const { openBudgetModal } = useUI();
  const { transactions } = useTransactions();

  useEffect(() => {
    const storedBudgets = localStorage.getItem(`axia_cat_budgets_${user.id}`);
    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets));
    }
  }, [user.id]);

  const calculateSpent = (cat) => {
    let spent = 0;
    transactions.forEach(tx => {
      if (tx.type === 'debit' && tx.category.toLowerCase() === cat.toLowerCase()) {
        const amt = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
        spent += amt;
      }
    });
    return spent;
  };

  const categories = [
    { icon: '🛒', name: 'Groceries', key: 'groceries', color: '#22d3ee' },
    { icon: '🏠', name: 'Rent', key: 'rent', color: '#6366f1' },
    { icon: '🎬', name: 'Entertainment', key: 'entertainment', color: '#f59e0b' },
    { icon: '🍽️', name: 'Dining', key: 'dining', color: '#10b981' },
    { icon: '🚗', name: 'Transport', key: 'transport', color: '#8b5cf6' },
    { icon: '💊', name: 'Health', key: 'health', color: '#ec4899' },
    { icon: '⚡', name: 'Utilities', key: 'utilities', color: '#facc15' },
    { icon: '🛍️', name: 'Shopping', key: 'shopping', color: '#3b82f6' },
  ];

  return (
    <div className="page-content">
      <div className="page-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Smart Budgets</h1>
          <p className="page-desc">Tracking manually against your specific targets</p>
        </div>
        <button className="btn-primary" onClick={openBudgetModal}>Update Budgets</button>
      </div>
      <div className="budgets-grid">
        {categories.map((cat) => {
          const budgetLimit = parseFloat(budgets[cat.key]) || 0;
          const spent = calculateSpent(cat.key);
          const pct = budgetLimit > 0 ? Math.round((spent / budgetLimit) * 100) : (spent > 0 ? 100 : 0);

          return (
            <div key={cat.key} className="budget-card glassmorphism">
              <div className="budget-card-icon">{cat.icon}</div>
              <div className="budget-card-name">{cat.name}</div>
              <div className="budget-card-meta">₹ {spent.toLocaleString('en-IN')} / ₹ {budgetLimit.toLocaleString('en-IN')}</div>
              <div className="budget-card-bar">
                <div className="budget-card-fill" style={{ width: `${Math.min(pct, 100)}%`, background: cat.color }}></div>
              </div>
              <div className="budget-card-pct" style={{ color: cat.color }}>{pct}% used</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Budgets;
