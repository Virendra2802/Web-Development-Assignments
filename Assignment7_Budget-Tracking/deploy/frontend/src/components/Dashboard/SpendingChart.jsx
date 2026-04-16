import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SpendingChart = ({ transactions }) => {
  const [period, setPeriod] = useState(6); // default 6 months

  const getChartData = () => {
    const months = [];
    const d = new Date();
    
    // Get months based on selected period
    for (let i = period - 1; i >= 0; i--) {
      const mDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      months.push(new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(mDate));
    }

    const categories = ['groceries', 'rent', 'entertainment', 'dining', 'transport'];
    const monthlyData = {
      groceries: new Array(period).fill(0),
      rent: new Array(period).fill(0),
      entertainment: new Array(period).fill(0),
      dining: new Array(period).fill(0),
      transport: new Array(period).fill(0)
    };

    transactions.forEach(tx => {
      if (tx.type !== 'debit') return;

      const [day, month, year] = tx.date.split('/');
      const txDate = new Date(year, month - 1, day);
      const monthsAgo = (d.getFullYear() - txDate.getFullYear()) * 12 + (d.getMonth() - txDate.getMonth());

      if (monthsAgo >= 0 && monthsAgo < period) {
        const idx = (period - 1) - monthsAgo;
        const cat = tx.category.toLowerCase();
        const amtStr = tx.amount.replace(/[^\d.-]/g, '');
        const amt = parseFloat(amtStr);
        
        if (monthlyData[cat] !== undefined) {
          monthlyData[cat][idx] += amt;
        } else if (cat.includes('food') || cat.includes('dining')) {
          monthlyData.dining[idx] += amt;
        } else if (cat.includes('housing') || cat.includes('rent')) {
          monthlyData.rent[idx] += amt;
        }
      }
    });

    return { months, monthlyData };
  };

  const { months, monthlyData } = getChartData();

  const data = {
    labels: months,
    datasets: [
      { label: 'Groceries', data: monthlyData.groceries, backgroundColor: 'rgba(34,211,238,0.75)', borderRadius: 4, stack: 'spend' },
      { label: 'Rent', data: monthlyData.rent, backgroundColor: 'rgba(99,102,241,0.75)', borderRadius: 4, stack: 'spend' },
      { label: 'Entertainment', data: monthlyData.entertainment, backgroundColor: 'rgba(245,158,11,0.75)', borderRadius: 4, stack: 'spend' },
      { label: 'Dining', data: monthlyData.dining, backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 4, stack: 'spend' },
      { label: 'Transport', data: monthlyData.transport, backgroundColor: 'rgba(236,72,153,0.75)', borderRadius: 4, stack: 'spend' },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,20,32,0.95)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 12,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ₹ ${context.parsed.y.toLocaleString('en-IN')}`
        }
      },
    },
    scales: {
      x: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { size: 11 } } },
      y: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { size: 11 }, callback: v => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v) } }
    }
  };

  return (
    <div className="card card-chart glassmorphism">
      <div className="card-header">
        <div>
          <div className="card-title">Monthly Spending Summary</div>
          <div className="card-subtitle">Aggregated over {period} months</div>
        </div>
        <div className="chart-controls">
          <button className={`chart-btn ${period === 6 ? 'active' : ''}`} onClick={() => setPeriod(6)}>6M</button>
          <button className={`chart-btn ${period === 3 ? 'active' : ''}`} onClick={() => setPeriod(3)}>3M</button>
          <button className={`chart-btn ${period === 1 ? 'active' : ''}`} onClick={() => setPeriod(1)}>1M</button>
          <span className="ai-live-badge">✦ AI Forecast</span>
        </div>
      </div>
      <div className="chart-wrapper" style={{ height: '240px' }}>
        <Bar data={data} options={options} />
      </div>
      <div className="chart-legend">
        <span className="legend-item"><span className="legend-dot" style={{ background: '#22d3ee' }}></span>Groceries</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#6366f1' }}></span>Rent</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }}></span>Entertainment</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#10b981' }}></span>Dining</span>
        <span className="legend-item"><span className="legend-dot" style={{ background: '#ec4899' }}></span>Transport</span>
      </div>
    </div>
  );
};

export default SpendingChart;
