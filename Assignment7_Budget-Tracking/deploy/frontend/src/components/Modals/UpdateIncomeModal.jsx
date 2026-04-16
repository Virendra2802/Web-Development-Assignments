import { useState } from 'react';
import axios from 'axios';

const UpdateIncomeModal = ({ onClose, user, setUser }) => {
  const [income, setIncome] = useState(user.income || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put('http://localhost:5000/api/auth/income', {
        userId: user.id || user._id,
        income: parseFloat(income)
      });
      
      // Merge carefully — backend returns Mongoose doc with _id
      const updatedUser = { 
        ...user, 
        income: parseFloat(income),  // use the value we sent, guaranteed to be fresh
        hasSetIncome: true,
        id: user.id || user._id      // preserve frontend id key
      };
      localStorage.setItem('axia_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      // Fire event so dashboard stats re-compute
      window.dispatchEvent(new Event('axia:transactions-updated'));
      onClose();
    } catch (err) {
      console.error('Error updating income:', err);
      const errorMsg = err.response?.data?.msg || err.message || 'Unknown error';
      alert(`Failed to update income: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal-box glassmorphism" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2 className="modal-title">💰 Set Monthly Income</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="expense-form" onSubmit={handleSubmit}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
            Set or update your primary monthly income to personalize your dashboard.
          </p>
          <div className="form-group">
            <label>Monthly Income (₹)</label>
            <div className="input-wrapper">
              <span className="input-prefix">₹</span>
              <input 
                type="number" 
                value={income} 
                onChange={(e) => setIncome(e.target.value)} 
                placeholder="e.g. 75000" 
                required 
                autoFocus
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Saving...' : 'Save Income →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateIncomeModal;
