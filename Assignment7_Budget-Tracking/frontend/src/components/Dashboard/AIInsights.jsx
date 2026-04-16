import { useState, useEffect } from 'react';
import axios from 'axios';

const AIInsights = ({ transactions, budgets }) => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAITips = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/ai/generate-tips', {
        transactions,
        budgets
      });
      setTips(response.data);
    } catch (err) {
      console.error('Failed to fetch AI tips:', err);
      // Fallback to local logic if Groq fails
      setTips(generateTips());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      fetchAITips();
    } else {
      setTips(generateTips());
    }
  }, [transactions, budgets]);

  const generateTips = () => {
    // ... logic for local tips (same as before)
    const spentMap = {};
    transactions.forEach(tx => {
      if (tx.type === 'debit') {
        const cat = tx.category.toLowerCase();
        const amt = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
        spentMap[cat] = (spentMap[cat] || 0) + amt;
      }
    });

    const localTips = [];
    Object.keys(budgets).forEach(cat => {
      const limit = parseFloat(budgets[cat]);
      if (limit <= 0) return;
      const spent = spentMap[cat] || 0;
      const pct = spent / limit;
      if (pct > 1.0) {
        localTips.push({ type: 'Budget Alert', text: `You have exceeded your <strong>${cat}</strong> budget!`, icon: '🛑', cls: 'tip-amber' });
      } else if (pct > 0.8) {
        localTips.push({ type: 'Warning', text: `Your ${cat} budget is <strong>${Math.round(pct * 100)}%</strong> used.`, icon: '⚠️', cls: 'tip-amber' });
      }
    });

    if (localTips.length < 2) {
      localTips.push({ type: 'AI Insight', text: 'Consider moving extra cash to investments.', icon: '📈', cls: 'tip-green' });
    }
    return localTips.slice(0, 4);
  };

  return (
    <div className="card card-tips glassmorphism">
      <div className="card-header">
        <div className="card-title">✦ Axia AI Intel</div>
        <button className={`refresh-btn ${loading ? 'spinning' : ''}`} onClick={fetchAITips} disabled={loading}>
          ↻
        </button>
      </div>
      <div className="tips-list">
        {loading ? (
          <div className="loading-tips">Analyzing your finances...</div>
        ) : (
          tips.map((tip, idx) => (
            <div key={idx} className={`tip-card ${tip.cls}`}>
              <div className="tip-icon">{tip.icon}</div>
              <div className="tip-body">
                <div className="tip-type">{tip.type}</div>
                <div className="tip-text" dangerouslySetInnerHTML={{ __html: tip.text }}></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIInsights;
