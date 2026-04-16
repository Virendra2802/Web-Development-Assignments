import { useState, useEffect } from 'react';

const SetBudgetsModal = ({ onClose, user }) => {
  const [budgets, setBudgets] = useState({
    groceries: 0,
    rent: 0,
    entertainment: 0,
    dining: 0,
    transport: 0,
    health: 0,
    utilities: 0,
    shopping: 0
  });

  useEffect(() => {
    const current = JSON.parse(localStorage.getItem(`axia_cat_budgets_${user.id}`) || '{}');
    setBudgets(prev => ({ ...prev, ...current }));
  }, [user.id]);

  const handleChange = (e) => {
    setBudgets({ ...budgets, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem(`axia_cat_budgets_${user.id}`, JSON.stringify(budgets));
    onClose();
    window.location.reload();
  };

  return (
    <div className="modal-overlay open" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal-box glassmorphism" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h2 className="modal-title">📊 Set Monthly Budgets</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="expense-form" onSubmit={handleSubmit}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '15px', fontSize: '14px' }}>
            Define exact limits for each category. These power your insights.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {Object.keys(budgets).map(cat => (
              <div key={cat} className="form-group">
                <label style={{ textTransform: 'capitalize' }}>{cat}</label>
                <input 
                  type="number" 
                  name={cat} 
                  value={budgets[cat]} 
                  onChange={handleChange} 
                  placeholder="0" 
                  min="0" 
                />
              </div>
            ))}
          </div>
          <button type="submit" className="btn-primary">Save Specific Budgets →</button>
        </form>
      </div>
    </div>
  );
};

export default SetBudgetsModal;
