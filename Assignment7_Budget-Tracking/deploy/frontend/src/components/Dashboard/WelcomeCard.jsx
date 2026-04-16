const WelcomeCard = ({ user, transactions }) => {
  const calculateBalance = () => {
    let incomeBase = parseFloat(user.income) || 0;
    let totalExpenses = 0;
    
    transactions.forEach(tx => {
      const amt = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
      if (tx.type === 'debit') {
        totalExpenses += amt;
      } else if (tx.type === 'credit' && !tx.category.toLowerCase().includes('income')) {
        // Add other credits (refunds, transfers) but ignore things categorized as 'Income' 
        // because we use the user.income setting as the primary source.
        incomeBase += amt;
      }
    });
    
    return incomeBase - totalExpenses;
  };

  const balance = calculateBalance();

  return (
    <div className="card card-welcome glassmorphism">
      <div className="welcome-text">
        <div className="welcome-greeting">Welcome Back, {user.name.split(' ')[0]}! 👋</div>
        <div className="welcome-subtitle">Account Holder: <strong>{user.name}</strong></div>
        <div className="balance-label">Current Bank Balance</div>
        <div className="balance-amount">₹ {balance.toLocaleString('en-IN')}<span className="balance-decimal">.00</span></div>
        <div className="balance-change positive">
          <span className="change-arrow">↑</span> +₹ 2,340 this month
        </div>
      </div>
      <div className="welcome-chart-mini">
        <canvas width="120" height="60"></canvas>
      </div>
    </div>
  );
};

export default WelcomeCard;
