import { useEffect, useRef } from 'react';

const HealthCard = ({ transactions, user }) => {
  const canvasRef = useRef(null);

  const calculateHealth = () => {
    let income = parseFloat(user.income) || 0;
    let spend = 0;
    
    transactions.forEach(tx => {
      const amt = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
      if (tx.type === 'debit') spend += amt;
      else if (tx.type === 'credit' && !tx.category.toLowerCase().includes('income')) {
        // Add additional income from transactions, but ignore things already categorized as general income
        income += amt;
      }
    });

    const savingsRate = income > 0 ? Math.round(((income - spend) / income) * 100) : 0;
    
    // Weighted score logic: 60% savings rate + 20% debt factor + 20% goals
    const savingsScore = Math.min(Math.max(savingsRate, 0), 100) * 0.6;
    const baseScore = 40; // Base score for starting out
    const finalScore = Math.round(baseScore + (savingsScore * 0.6));
    
    const score = Math.min(Math.max(finalScore, 0), 100);
    const status = score > 75 ? 'Excellent' : score > 50 ? 'Good' : 'Needs Work';
    
    return { score, savingsRate, status };
  };

  const { score, savingsRate, status } = calculateHealth();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H * 0.92, r = Math.min(W, H * 1.9) * 0.42;
    const startAngle = Math.PI, endAngle = 2 * Math.PI;
    const normalizedScore = score / 100;

    ctx.clearRect(0, 0, W, H);
    
    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Fill arc
    const fillEnd = startAngle + normalizedScore * Math.PI;
    const grad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.5, '#10b981');
    grad.addColorStop(1, '#22d3ee');
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, fillEnd);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();
  }, [score]);

  return (
    <div className="card card-health glassmorphism">
      <div className="health-header">
        <span className="health-title">Financial Health Score</span>
        <span className={`health-badge ${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
      </div>
      <div className="health-gauge-wrap">
        <canvas ref={canvasRef} width="160" height="90" aria-label="Health score gauge"></canvas>
        <div className="gauge-value">{score}</div>
        <div className="gauge-label">/100</div>
      </div>
      <div className="health-stats">
        <div className="health-stat">
          <span className="hs-label">Savings Rate</span>
          <span className={`hs-value ${savingsRate > 20 ? 'positive' : ''}`}>{savingsRate}%</span>
        </div>
        <div className="health-stat"><span className="hs-label">Debt Ratio</span><span className="hs-value">12%</span></div>
        <div className="health-stat"><span className="hs-label">Goals On Track</span><span className="hs-value positive">3/4</span></div>
      </div>
    </div>
  );
};

export default HealthCard;
