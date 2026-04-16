import { useState } from 'react';
import axios from 'axios';

const AddExpenseModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    desc: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      const storedUser = localStorage.getItem('axia_user');
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const newTx = {
        userId: user.id || user._id,
        desc: formData.desc || 'New Expense',
        category: formData.category,
        catClass: getCatClass(formData.category),
        date: new Date(formData.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/'),
        amount: `−₹ ${parseFloat(formData.amount).toLocaleString('en-IN')}`,
        type: 'debit',
        confidence: Math.floor(Math.random() * 15 + 83),
        status: 'pending'
      };

      await axios.post('http://localhost:5000/api/transactions', newTx);
      onClose();
      // In a real app, I'd trigger a reload of transactions
      window.location.reload(); 
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  return (
    <div className="modal-overlay open" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal-box glassmorphism">
        <div className="modal-header">
          <h2 className="modal-title">➕ Add Expense</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="expense-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount (₹)</label>
            <div className="input-wrapper">
              <span className="input-prefix">₹</span>
              <input 
                type="number" 
                name="amount" 
                placeholder="0.00" 
                value={formData.amount} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label>Category <span className="ai-badge">✦ AI-Predictive</span></label>
            <div className="input-wrapper">
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select category…</option>
                <option value="groceries">🛒 Groceries</option>
                <option value="rent">🏠 Rent & Housing</option>
                <option value="entertainment">🎬 Entertainment</option>
                <option value="dining">🍽️ Dining Out</option>
                <option value="transport">🚗 Transport</option>
                <option value="health">💊 Health & Fitness</option>
                <option value="shopping">🛍️ Shopping</option>
                <option value="utilities">⚡ Utilities</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <input 
              type="text" 
              name="desc" 
              placeholder="e.g. Starbucks Coffee" 
              value={formData.desc} 
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              name="date" 
              value={formData.date} 
              onChange={handleChange} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary">
            <span>Save Expense</span>
            <span className="btn-icon">→</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
