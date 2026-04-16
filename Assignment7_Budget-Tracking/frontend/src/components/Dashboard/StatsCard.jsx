import { useUI } from '../../context/UIContext';

const StatsCard = ({ transactions, user }) => {
  const { openIncomeModal } = useUI();

  const calculateStats = () => {
    let spend = 0;
    let investments = 0;

    transactions.forEach(tx => {
      if (tx.type === 'debit') {
        const amtStr = tx.amount.replace(/[^\d.-]/g, '');
        const amt = parseFloat(amtStr);
        spend += amt;
        if (tx.category.toLowerCase().includes('invest')) {
          investments += amt;
        }
      }
    });

    const income = user.income || 0;
    const netSavings = income - spend;

    return {
      income,
      spend,
      netSavings,
      investments
    };
  };

  const stats = calculateStats();

  return (
    <div className="card card-stats glassmorphism">
      <div className="stats-grid">
        <div className="stat-item clickable" onClick={openIncomeModal} title="Click to update income">
          <div className="stat-icon icon-income">↑</div>
          <div className="stat-info">
            <div className="stat-label">Monthly Income ⚙️</div>
            <div className="stat-value">₹ {stats.income.toLocaleString('en-IN')}</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon icon-expense">↓</div>
          <div className="stat-info">
            <div className="stat-label">Monthly Spend</div>
            <div className="stat-value">₹ {stats.spend.toLocaleString('en-IN')}</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon icon-savings">✦</div>
          <div className="stat-info">
            <div className="stat-label">Net Savings</div>
            <div className={`stat-value ${stats.netSavings >= 0 ? 'positive' : ''}`}>
              ₹ {stats.netSavings.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon icon-invest">◈</div>
          <div className="stat-info">
            <div className="stat-label">Investments</div>
            <div className="stat-value">₹ {stats.investments.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
