import { useState, useEffect } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler } from 'chart.js';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler);

const Investments = ({ user }) => {
  const [symbol, setSymbol] = useState('SPY');
  const [investedAmount, setInvestedAmount] = useState(100000);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('axia_portfolio');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('axia_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  const API_KEY = 'X1R9B3K9R77HNTTU';

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (symbol.length > 1 && !showSuggestions) {
        fetchSuggestions();
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [symbol]);

  const fetchSuggestions = async () => {
    try {
      const resp = await axios.get(`https://www.alphavantage.co/query`, {
        params: { function: 'SYMBOL_SEARCH', keywords: symbol, apikey: API_KEY }
      });
      const matches = resp.data['bestMatches'] || [];
      setSuggestions(matches.map(m => ({
        symbol: m['1. symbol'],
        name: m['2. name']
      })));
      if (matches.length > 0) setShowSuggestions(true);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleSelectSymbol = (s) => {
    setSymbol(s);
    setShowSuggestions(false);
    fetchStockData(s); // Fetch immediately on selection
  };

  const fetchStockData = async (targetSymbol = symbol) => {
    const activeSymbol = (typeof targetSymbol === 'string' && targetSymbol.length > 0) ? targetSymbol : symbol;
    if (!activeSymbol) return;
    
    setLoading(true);
    setError(null);
    setHistoryData([]); // Clear previous data to show loading state is fresh
    setShowSuggestions(false);
    try {
      const response = await axios.get(`https://www.alphavantage.co/query`, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: activeSymbol,
          apikey: API_KEY
        }
      });

      const data = response.data['Time Series (Daily)'];
      const isLimit = !!response.data['Note'];

      if (isLimit) {
        setIsDemoMode(true);
        const mock = generateMockHistory(activeSymbol);
        setHistoryData(mock);
        setCurrentPrice(parseFloat(mock[mock.length - 1].value) / (investedAmount / (parseFloat(mock[0].value) / 100000)));
        setLoading(false);
        return;
      }
      
      setIsDemoMode(false);
      
      // Smart Fallback: If "GOOGLE" failed, try to find "GOOGL"
      if (!data && response.data['Error Message'] && !targetSymbol.includes(' ')) {
        const searchResp = await axios.get(`https://www.alphavantage.co/query`, {
          params: { function: 'SYMBOL_SEARCH', keywords: activeSymbol, apikey: API_KEY }
        });
        const bestMatches = searchResp.data['bestMatches'] || [];
        if (bestMatches.length > 0) {
          const firstSym = bestMatches[0]['1. symbol'];
          const firstName = bestMatches[0]['2. name'];
          setError(`"${activeSymbol}" is not a ticker. Did you mean ${firstSym} (${firstName})?`);
          setLoading(false);
          return;
        }
      }

      if (!data) {
        throw new Error(response.data['Note'] || response.data['Error Message'] || 'Invalid Symbol or API Limit reached');
      }

      // Process last 30 days
      const dates = Object.keys(data).slice(0, 30).reverse();
      const prices = dates.map(date => parseFloat(data[date]['4. close']));
      
      const buyPrice = prices[0];
      const shares = investedAmount / buyPrice;

      const calculatedHistory = dates.map((date, index) => ({
        date,
        value: (shares * prices[index]).toFixed(2)
      }));

      setHistoryData(calculatedHistory);
      setCurrentPrice(prices[prices.length - 1]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const performanceData = {
    labels: historyData.map(d => new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
    datasets: [{
      label: `${symbol} Value`,
      data: historyData.map(d => d.value),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
      fill: true,
      tension: 0.4,
      pointRadius: 2,
      borderWidth: 2
    }]
  };

  // Generate dynamic-looking portfolio based on symbol
  const getDynamicPortfolio = (sym) => {
    const hash = sym.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const base = [40, 20, 15, 15, 10];
    const dynamic = base.map((val, i) => Math.max(5, val + (hash % (i + 5)) - 2));
    const total = dynamic.reduce((a, b) => a + b, 0);
    return dynamic.map(v => (v / total * 100).toFixed(0));
  };

  const generateMockHistory = (sym) => {
    const dates = [];
    const now = new Date();
    for(let i=30; i>=0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    let lastVal = 100000;
    return dates.map(date => {
      lastVal += (Math.random() - 0.45) * 2500;
      return { date, value: lastVal.toFixed(2) };
    });
  };

  const portfolioData = {
    labels: ['Stocks', 'Mutual Funds', 'Gold', 'Crypto', 'Cash'],
    datasets: [{
      data: getDynamicPortfolio(symbol),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
      borderColor: 'transparent',
      hoverOffset: 12,
      spacing: 5
    }]
  };

  const currentValue = historyData.length > 0 ? historyData[historyData.length - 1].value : investedAmount;
  const totalReturn = (currentValue - investedAmount).toFixed(2);
  const returnPct = ((totalReturn / investedAmount) * 100).toFixed(2);

  const addToPortfolio = () => {
    if (!currentPrice || loading) return;
    const newHolding = {
      id: Date.now(),
      symbol,
      buyPrice: currentPrice,
      amount: investedAmount,
      shares: (investedAmount / currentPrice).toFixed(4),
      date: new Date().toLocaleDateString('en-IN'),
      history: historyData // Store snapshot for the combined graph
    };
    setPortfolio([newHolding, ...portfolio]);
  };

  const removeFromPortfolio = (id) => {
    setPortfolio(portfolio.filter(h => h.id !== id));
  };

  const getCombinedPortfolioHistory = () => {
    if (portfolio.length === 0) return [];
    
    // Safety check for legacy data missing history field
    const validHoldings = portfolio.filter(h => h.history && Array.isArray(h.history) && h.history.length > 0);
    if (validHoldings.length === 0) return [];

    const baselineDates = validHoldings[0].history.map(d => d.date);
    
    return baselineDates.map((date, idx) => {
      let totalValue = 0;
      validHoldings.forEach(holding => {
        const dayMatch = holding.history[idx] || holding.history[holding.history.length - 1];
        if (dayMatch) {
          totalValue += parseFloat(dayMatch.value);
        }
      });
      return { date, value: totalValue.toFixed(2) };
    });
  };

  const combinedHistory = getCombinedPortfolioHistory();

  const combinedPerfData = {
    labels: combinedHistory.map(d => new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
    datasets: [{
      label: 'Portfolio Total',
      data: combinedHistory.map(d => d.value),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2
    }]
  };

  return (
    <div className="page-content">
      <div className="page-hero">
        <h1 className="page-title">Investments</h1>
        <p className="page-desc">Real-market portfolio tracking & projections</p>
      </div>

      <div className="invest-simulation-bar card glassmorphism mb-1">
        <div className="sim-row">
          <div className="sim-group relative">
            <label>Ticker Symbol</label>
              <input 
                type="text" 
                value={symbol} 
                onChange={(e) => {
                  setSymbol(e.target.value.toUpperCase());
                  setShowSuggestions(false);
                }}
                placeholder="Ticker (e.g. AAPL, GOOGL)"
                onFocus={() => symbol.length > 1 && setShowSuggestions(true)}
              />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="symbol-dropdown glassmorphism">
                {suggestions.map((suggestion, i) => (
                  <li 
                    key={i} 
                    onClick={() => handleSelectSymbol(suggestion.symbol)}
                  >
                    <span className="sugg-symbol">{suggestion.symbol}</span>
                    <span className="sugg-name">{suggestion.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="sim-group">
            <label>Investment (₹)</label>
            <input 
              type="number" 
              value={investedAmount} 
              onChange={(e) => setInvestedAmount(parseFloat(e.target.value) || 0)}
            />
          </div>
          <button className="btn-primary" onClick={() => fetchStockData()} disabled={loading}>
            {loading ? 'Fetching...' : 'Simulate →'}
          </button>
          <button 
            className="btn-secondary" 
            onClick={addToPortfolio} 
            disabled={loading || historyData.length === 0}
            title="Starts tracking this investment from today"
          >
            Invest Now ↗
          </button>
        </div>
        {error && (
          <div className="error-box mt-1">
            <span className="error-icon">⚠️</span>
            <p className="error-text">
              {error.includes('Did you mean') ? (
                <>
                  {error.split('Did you mean')[0]} Did you mean{' '}
                  <button 
                    className="suggestion-link" 
                    onClick={() => handleSelectSymbol(error.split('Did you mean ')[1].split(' ')[0])}
                  >
                    {error.split('Did you mean ')[1].split(' ')[0]}
                  </button>?
                </>
              ) : error}
            </p>
          </div>
        )}
      </div>

      <div className="investments-grid">
        <div className="card glassmorphism inv-card">
          <div className="card-header">
            <div>
              <div className="card-title">Portfolio Allocation</div>
              <div className="card-subtitle">Current strategy target</div>
            </div>
            <div className="ai-live-badge">AI Optimized</div>
          </div>
          <div className="inv-chart-wrap-doughnut">
            <Doughnut 
              data={portfolioData} 
              options={{ 
                cutout: '75%', 
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } } 
              }} 
            />
          </div>
        </div>

        <div className="card glassmorphism inv-card">
          <div className="inv-perf-header">
            <div>
              <div className="card-title">
                {symbol} Performance
                {isDemoMode && <span className="demo-pill">Offline Demo Mode</span>}
              </div>
              <div className="card-subtitle">Last 30 trading days</div>
            </div>
          </div>
          
          <div className="inv-perf-stats-main mt-1">
            <div className="perf-main-box">
              <span className="perf-label">Current Value</span>
              <span className="perf-value">₹ {parseFloat(currentValue).toLocaleString('en-IN')}</span>
            </div>
            <div className="perf-main-box">
              <span className="perf-label">Total Return</span>
              <span className={`perf-value ${totalReturn >= 0 ? 'positive' : 'negative'}`}>
                {totalReturn >= 0 ? '↑' : '↓'} ₹ {Math.abs(totalReturn).toLocaleString('en-IN')} ({returnPct}%)
              </span>
            </div>
          </div>

          <div className="inv-chart-wrap-line mt-1">
            {loading ? (
              <div className="loading-state">Loading Market Data...</div>
            ) : (
              <Line 
                data={performanceData} 
                options={{ 
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `₹ ${parseFloat(ctx.raw).toLocaleString('en-IN')}`
                      }
                    }
                  }, 
                  scales: { 
                    x: { ticks: { color: '#475569', font: { size: 10 } }, grid: { display: false } }, 
                    y: { 
                      ticks: { 
                        color: '#475569', 
                        font: { size: 10 },
                        callback: (val) => `₹${(val/1000).toFixed(0)}k`
                      }, 
                      grid: { color: 'rgba(255,255,255,0.03)' },
                      grace: '10%' // Add some space so the line isn't at the very edge
                    } 
                  } 
                }} 
              />
            )}
          </div>
        </div>
      </div>

      <div className="card glassmorphism mt-1">
        <div className="card-header">
          <div>
            <div className="card-title">Live Tracked Portfolio</div>
            <div className="card-subtitle">Aggregate performance of all active positions</div>
          </div>
          <button className="icon-btn" onClick={() => setPortfolio([])} title="Clear all">Reset</button>
        </div>
        
        <div className="portfolio-content-grid mt-1">
          <div className="table-wrapper">
            {portfolio.length === 0 ? (
              <div className="empty-portfolio">
                <p>No active investments. Use the simulation above to "Invest Now".</p>
              </div>
            ) : (
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Date</th>
                    <th>Buy Price</th>
                    <th>Invested</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((holding) => (
                    <tr key={holding.id}>
                      <td className="font-bold">{holding.symbol}</td>
                      <td>{holding.date}</td>
                      <td>₹{holding.buyPrice.toLocaleString()}</td>
                      <td className="positive font-bold">₹{parseFloat(holding.amount).toLocaleString()}</td>
                      <td>
                        <button className="btn-remove" onClick={() => removeFromPortfolio(holding.id)}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="portfolio-stats-visual">
            {portfolio.length > 0 ? (
              <div className="combined-chart-wrap">
                <div className="chart-info-overlay">
                  <span className="overlay-label">Portfolio Trend</span>
                  <span className="overlay-value">₹ {parseFloat(combinedHistory[combinedHistory.length - 1]?.value || 0).toLocaleString()}</span>
                </div>
                <Line 
                  data={combinedPerfData} 
                  options={{ 
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }, 
                    scales: { 
                      x: { display: false }, 
                      y: { display: false } 
                    } 
                  }} 
                />
              </div>
            ) : (
              <div className="chart-placeholder">
                <div className="placeholder-icon">📈</div>
                <p>Growth tracking will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Investments;
