import { useState, useEffect } from 'react';
import useTransactions from '../hooks/useTransactions';
import WelcomeCard from '../components/Dashboard/WelcomeCard';
import HealthCard from '../components/Dashboard/HealthCard';
import StatsCard from '../components/Dashboard/StatsCard';
import SpendingChart from '../components/Dashboard/SpendingChart';
import AIInsights from '../components/Dashboard/AIInsights';
import TransactionFeed from '../components/Dashboard/TransactionFeed';

import { useUI } from '../context/UIContext';

const Dashboard = ({ user }) => {
  const { transactions, loading } = useTransactions();
  const [budgets, setBudgets] = useState({});
  const { openIncomeModal } = useUI();

  useEffect(() => {
    const storedBudgets = localStorage.getItem(`axia_cat_budgets_${user.id}`);
    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets));
    }
    
    // Auto-prompt to set income if not set yet
    if (!user.hasSetIncome) {
      openIncomeModal();
    }
  }, [user.id, user.hasSetIncome, openIncomeModal]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-content">
      <div className="dashboard-header-main" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div className="welcome-section">
          <h1 className="page-title" style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>Financial Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Real-time insights from your transactions and goals.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={openIncomeModal} style={{ 
            padding: '10px 20px', 
            borderRadius: '12px', 
            backgroundColor: 'rgba(255,255,255,0.05)', 
            border: '1.5px solid rgba(255,255,255,0.08)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>💰</span> Update Income
          </button>
        </div>
      </div>

      {/* ROW 1: Welcome + Balance + Health */}
      <section className="grid-row row-top">
        <WelcomeCard user={user} transactions={transactions} />
        <HealthCard transactions={transactions} user={user} />
        <StatsCard transactions={transactions} user={user} />
      </section>

      {/* ROW 2: Spending Chart + AI Tips */}
      <section className="grid-row row-mid">
        <SpendingChart transactions={transactions} />
        <AIInsights transactions={transactions} budgets={budgets} />
      </section>

      {/* ROW 3: Transaction Feed */}
      <section className="grid-row row-bottom">
        <TransactionFeed transactions={transactions} />
      </section>
    </div>
  );
};

export default Dashboard;
