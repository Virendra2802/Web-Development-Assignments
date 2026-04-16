/* ============================================================
   AXIA FINANCE — app.js
   Full dashboard logic: charts, tables, modals, navigation
   ============================================================ */

'use strict';

/* ── Auth Check ───────────────────────────────────────────── */
if (!localStorage.getItem('axia_token')) {
  window.location.href = 'login.html';
}

const user = JSON.parse(localStorage.getItem('axia_user') || '{}');

/* ── Utility helpers ──────────────────────────────────────── */
const $ = id => document.getElementById(id);
const qs = (sel, root = document) => root.querySelector(sel);
const qsAll = (sel, root = document) => [...root.querySelectorAll(sel)];

function showToast(msg, type = 'info', icon = 'ℹ️') {
  const container = $('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(50px)'; toast.style.transition = 'all 0.3s'; setTimeout(() => toast.remove(), 320); }, 3500);
}

function formatDate(d) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
}

/* ── Date in topbar ───────────────────────────────────────── */
(function setDate() {
  const el = $('topbarDate');
  if (el) el.textContent = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
})();

/* ── Set default date for expense form ───────────────────── */
(function setDefaultDate() {
  const el = $('expDate');
  if (el) { const d = new Date(); el.value = d.toISOString().split('T')[0]; }
})();

/* ============================================================
   NAVIGATION
   ============================================================ */
const pages = ['dashboard', 'budgets', 'investments', 'profile'];

function showPage(pageId) {
  pages.forEach(p => {
    const pg = $(`page-${p}`);
    const nav = $(`nav-${p}`);
    if (pg) pg.classList.toggle('hidden', p !== pageId);
    if (nav) nav.classList.toggle('active', p === pageId);
  });

  const breadcrumb = $('breadcrumbCurrent');
  if (breadcrumb) {
    const labels = { dashboard: 'Dashboard', budgets: 'Budgets', investments: 'Investments', profile: 'Profile & Settings' };
    breadcrumb.textContent = labels[pageId] || pageId;
  }

  // Init charts for newly visible pages
  if (pageId === 'investments') initInvestmentCharts();
  if (pageId === 'budgets') renderBudgetsPage();
}

qsAll('.nav-item').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = link.dataset.page;
    if (page) showPage(page);
  });
});

/* ============================================================
   MODALS
   ============================================================ */
const modal = $('addExpenseModal');
const budgetsModal = $('setBudgetsModal');

function openModal() { modal.classList.add('open'); $('expAmount').focus(); }
function closeModalFn() { modal.classList.remove('open'); }

function openBudgetsModalFn() {
  const current = JSON.parse(localStorage.getItem(`axia_cat_budgets_${user.id}`) || '{}');
  $('bud-groceries').value = current['groceries'] || 0;
  $('bud-rent').value = current['rent'] || 0;
  $('bud-entertainment').value = current['entertainment'] || 0;
  $('bud-dining').value = current['dining'] || 0;
  $('bud-transport').value = current['transport'] || 0;
  $('bud-health').value = current['health'] || 0;
  $('bud-utilities').value = current['utilities'] || 0;
  $('bud-shopping').value = current['shopping'] || 0;
  budgetsModal.style.display = 'flex';
}
function closeBudgetsModalFn() { budgetsModal.style.display = 'none'; }

$('openAddExpense').addEventListener('click', openModal);
$('closeModal').addEventListener('click', closeModalFn);
modal.addEventListener('click', e => { if (e.target === modal) closeModalFn(); });

$('openBudgetsBtn')?.addEventListener('click', openBudgetsModalFn);
$('closeBudgetsModal')?.addEventListener('click', closeBudgetsModalFn);
budgetsModal.addEventListener('click', e => { if (e.target === budgetsModal) closeBudgetsModalFn(); });

// Keyboard close
document.addEventListener('keydown', e => { 
  if (e.key === 'Escape') { 
    closeModalFn(); 
    closeProfilePanel(); 
    closeBudgetsModalFn();
  } 
});

// Set Budgets form submit
$('setBudgetsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const budgets = {
    groceries: parseFloat($('bud-groceries').value) || 0,
    rent: parseFloat($('bud-rent').value) || 0,
    entertainment: parseFloat($('bud-entertainment').value) || 0,
    dining: parseFloat($('bud-dining').value) || 0,
    transport: parseFloat($('bud-transport').value) || 0,
    health: parseFloat($('bud-health').value) || 0,
    utilities: parseFloat($('bud-utilities').value) || 0,
    shopping: parseFloat($('bud-shopping').value) || 0
  };
  localStorage.setItem(`axia_cat_budgets_${user.id}`, JSON.stringify(budgets));
  showToast('Category budgets updated successfully!', 'success', '📊');
  closeBudgetsModalFn();
  
  // Re-render everything dependent on budgets
  renderBudgetCircles();
  renderBudgetsPage();
  updateDashboardBalance();
  updateDynamicAlerts();
});

// AI Category hint
$('expAmount').addEventListener('input', function() {
  const amt = parseFloat(this.value);
  const hint = $('aiCategoryHint');
  if (!hint) return;
  if (amt > 0 && amt <= 200)     hint.textContent = '✦ Likely: Dining';
  else if (amt > 200 && amt <= 1000) hint.textContent = '✦ Likely: Groceries';
  else if (amt > 1000 && amt <= 5000) hint.textContent = '✦ Likely: Shopping';
  else if (amt > 5000) hint.textContent = '✦ Likely: Rent';
  else hint.textContent = '';
});

// Form submit
$('addExpenseForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const amount   = $('expAmount').value;
  const category = $('expCategory').value;
  const desc     = $('expDesc').value || 'New Expense';
  const date     = $('expDate').value;

  if (!amount || !category || !date) { showToast('Please fill all required fields.', 'error', '❌'); return; }

  // Create new transaction object
  const newTx = {
    desc,
    category,
    date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/'),
    amount: `−₹ ${parseFloat(amount).toLocaleString('en-IN')}`,
    type: 'debit',
    confidence: Math.floor(Math.random() * 15 + 83),
    status: 'pending',
    catClass: getCatClass(category)
  };

  try {
    const res = await fetch('http://localhost:5000/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx)
    });
    
    if (res.ok) {
      const savedTx = await res.json();
      transactions.unshift(savedTx); // Add to local state
      currentPage = 0;
      renderTransactions();
      
      closeModalFn();
      this.reset();
      $('expDate').value = new Date().toISOString().split('T')[0];
      showToast(`Expense of ₹${parseFloat(amount).toLocaleString('en-IN')} added!`, 'success', '✅');
    } else {
      showToast('Error saving expense to server.', 'error', '❌');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Network error, please try again.', 'error', '❌');
  }
});

function getCatClass(cat) {
  const map = { groceries: 'cat-groceries', rent: 'cat-rent', entertainment: 'cat-entertainment', dining: 'cat-food', transport: 'cat-transport', health: 'cat-health', shopping: 'cat-groceries', utilities: 'cat-rent' };
  return map[cat] || 'cat-food';
}

/* ============================================================
   PROFILE PANEL
   ============================================================ */
const profilePanel = $('profilePanel');

function openProfilePanel() { profilePanel.classList.add('open'); }
function closeProfilePanel() { profilePanel.classList.remove('open'); }

$('openProfile').addEventListener('click', openProfilePanel);
$('topbarProfile').addEventListener('click', openProfilePanel);
$('topbarProfile').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openProfilePanel(); });
$('closeProfile').addEventListener('click', closeProfilePanel);

// Close on outside click
document.addEventListener('click', e => {
  if (profilePanel.classList.contains('open') &&
    !profilePanel.contains(e.target) &&
    e.target !== $('openProfile') &&
    !$('openProfile').contains(e.target) &&
    e.target !== $('topbarProfile') &&
    !$('topbarProfile').contains(e.target)) {
    closeProfilePanel();
  }
});

// Profile nav link → profile page
$('nav-profile').addEventListener('click', e => { e.preventDefault(); showPage('profile'); });

/* ---- Profile Panel Menu Actions ---- */
qsAll('.profile-menu-item').forEach(item => {
  item.addEventListener('click', () => {
    const text = item.textContent.trim();
    if (text.includes('Edit Profile') || text.includes('Settings')) {
      closeProfilePanel();
      showPage('profile');
      showToast('Navigated to Profile & Settings.', 'info', '👤');
    } else if (text.includes('Logout')) {
      showToast('Logging out… See you soon!', 'info', '👋');
      localStorage.removeItem('axia_token');
      localStorage.removeItem('axia_user');
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
      closeProfilePanel();
    } else {
      showToast(`Opening ${text.replace(/^[^\w]+/, '').trim()}…`, 'info', 'ℹ️');
    }
  });
});

/* ============================================================
   QUICK ADD (Sidebar collapsible)
   ============================================================ */
const quickToggle  = $('quickAddToggle');
const quickBody    = $('quickAddBody');
const quickChevron = $('quickChevron');
let quickOpen = false;

quickToggle.addEventListener('click', () => {
  quickOpen = !quickOpen;
  quickBody.classList.toggle('collapsed', !quickOpen);
  quickChevron.classList.toggle('open', quickOpen);
});
// Start collapsed
quickBody.classList.add('collapsed');

$('quickSave').addEventListener('click', () => {
  const amt = $('quickAmount').value;
  const cat = $('quickCat').value;
  if (!amt || !cat) { showToast('Enter amount and pick a category.', 'error', '❌'); return; }
  showToast(`Quick-saved ₹${parseFloat(amt).toFixed(0)} for ${cat}`, 'success', '✅');
  $('quickAmount').value = '';
  $('quickCat').value = '';
});

/* ============================================================
   MINI SPARKLINE (Welcome card)
   ============================================================ */
(function drawSparkline() {
  const canvas = $('miniSparkline');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = [38200, 40100, 39500, 41800, 43000, 42500, 45670];
  const W = canvas.width, H = canvas.height;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * (W - 8) + 4,
    y: H - 4 - ((v - min) / (max - min)) * (H - 8)
  }));
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, '#10b981');
  grad.addColorStop(1, '#22d3ee');
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();
  // Fill
  ctx.lineTo(pts[pts.length-1].x, H);
  ctx.lineTo(pts[0].x, H);
  ctx.closePath();
  const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
  fillGrad.addColorStop(0, 'rgba(16,185,129,0.25)');
  fillGrad.addColorStop(1, 'rgba(16,185,129,0)');
  ctx.fillStyle = fillGrad;
  ctx.fill();
})();

/* ============================================================
   HEALTH GAUGE (Doughnut)
   ============================================================ */
(function drawGauge() {
  const canvas = $('healthGauge');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H * 0.92, r = Math.min(W, H * 1.9) * 0.42;
  const startAngle = Math.PI, endAngle = 2 * Math.PI;
  const score = 0.85;

  // Background arc
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Fill arc
  const fillEnd = startAngle + score * Math.PI;
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

  // Tick marks
  for (let i = 0; i <= 10; i++) {
    const angle = Math.PI + (i / 10) * Math.PI;
    const x1 = cx + (r - 8) * Math.cos(angle);
    const y1 = cy + (r - 8) * Math.sin(angle);
    const x2 = cx + (r + 2) * Math.cos(angle);
    const y2 = cy + (r + 2) * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
})();

/* ============================================================
   DYNAMIC MONTHLY SPENDING CHART
   ============================================================ */
let spendingChart;
function createSpendingChart() {
  const ctx = qs('#spendingChart')?.getContext('2d');
  if(!ctx) return;
  if (spendingChart) spendingChart.destroy();
  
  // Aggregate real transactions by month
  if (transactions.length === 0) {
    // Show empty state inside the chart container ideally, but we'll leave chart empty for now
    qs('#spendingChart').parentElement.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:40px;">No transactions found. Add expenses to view history.</div>';
    return;
  }
  
  // Get last 6 months dynamically based on current date
  const labels = [];
  const monthlyData = { groceries: [], rent: [], entertainment: [], dining: [], transport: [] };
  
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const mDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
    labels.push(new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(mDate));
    Object.keys(monthlyData).forEach(k => monthlyData[k].push(0));
  }

  transactions.forEach(tx => {
    if (tx.type === 'credit') return;
    const txDate = new Date(tx.date.split('/').reverse().join('-')); // assuming DD/MM/YYYY
    const monthsAgo = (d.getFullYear() - txDate.getFullYear()) * 12 + (d.getMonth() - txDate.getMonth());
    if (monthsAgo >= 0 && monthsAgo < 6) {
      const idx = 5 - monthsAgo;
      const cat = tx.category.toLowerCase();
      const amt = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
      if (monthlyData[cat]) monthlyData[cat][idx] += amt;
    }
  });

  spendingChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Groceries',    data: monthlyData.groceries,     backgroundColor: 'rgba(34,211,238,0.75)', borderRadius: 4, stack: 'spend' },
        { label: 'Rent',         data: monthlyData.rent,          backgroundColor: 'rgba(99,102,241,0.75)', borderRadius: 4, stack: 'spend' },
        { label: 'Entertainment',data: monthlyData.entertainment, backgroundColor: 'rgba(245,158,11,0.75)', borderRadius: 4, stack: 'spend' },
        { label: 'Dining',       data: monthlyData.dining,        backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 4, stack: 'spend' },
        { label: 'Transport',    data: monthlyData.transport,     backgroundColor: 'rgba(236,72,153,0.75)', borderRadius: 4, stack: 'spend' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,20,32,0.95)', borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1, padding: 12, titleColor: '#f1f5f9', bodyColor: '#94a3b8',
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ₹ ${ctx.parsed.y.toLocaleString('en-IN')}` }
        }
      },
      scales: {
        x: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { size: 11 } } },
        y: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { size: 11 }, callback: v => '₹' + (v/1000).toFixed(0) + 'k' } }
      }
    }
  });
}

qsAll('.chart-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    qsAll('.chart-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // For a fully dynamic app, we usually re-aggregate based on the exact period.
    // However, we just show the full 6-m trend directly via createSpendingChart now (already dynamic).
  });
});

/* ============================================================
   DYNAMIC AI ALERTS & INSIGHTS
   ============================================================ */
function updateDynamicAlerts() {
  const alertsContainer = $('alertsList');
  const tipsContainer = $('tipsList');
  if (!alertsContainer && !tipsContainer) return;
  
  const budgets = JSON.parse(localStorage.getItem(`axia_cat_budgets_${user.id}`) || '{}');
  const spentMap = {};
  transactions.forEach(tx => {
    if (tx.type === 'debit') {
      const amt = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
      spentMap[tx.category.toLowerCase()] = (spentMap[tx.category.toLowerCase()] || 0) + amt;
    }
  });

  const alerts = [];
  const tips = [];

  if (Object.keys(budgets).length === 0) {
    const emptyUI = '<div style="color:var(--text-muted);font-size:13px;padding:20px;">No budget limits defined. Please configure your budgets to get dynamic insights.</div>';
    if(alertsContainer) alertsContainer.innerHTML = emptyUI;
    if(tipsContainer) tipsContainer.innerHTML = emptyUI;
    return;
  }

  // Generate dynamic alerts based strictly on comparison!
  Object.keys(budgets).forEach(cat => {
    const limit = parseFloat(budgets[cat]);
    if(limit <= 0) return;
    const spent = spentMap[cat] || 0;
    const pct = spent / limit;
    
    if (pct > 1.0) {
      alerts.push(`
        <div class="alert-item alert-warning" role="alert">
          <div class="alert-icon">⚠️</div>
          <div class="alert-body">
            <div class="alert-type">Budget Exceeded!</div>
            <div class="alert-text">You have spent <strong>${Math.round(pct*100)}%</strong> of your ${cat} budget. Reduce spending strictly!</div>
          </div>
        </div>
      `);
      tips.push({ type: 'Urgent Alert', text: `You are over budget on ${cat} by ₹${(spent-limit).toLocaleString('en-IN')}.`, icon: '🛑', cls: 'tip-amber' });
    } else if (pct > 0.8) {
      alerts.push(`
        <div class="alert-item alert-info" role="alert">
          <div class="alert-icon">📊</div>
          <div class="alert-body">
            <div class="alert-type">Nearing Limit</div>
            <div class="alert-text">${cat.charAt(0).toUpperCase() + cat.slice(1)} budget is <strong>${Math.round(pct*100)}% utilized</strong>.</div>
          </div>
        </div>
      `);
      tips.push({ type: 'Budget Nearing', text: `${cat} spend is high. Only ₹${(limit-spent).toLocaleString('en-IN')} left.`, icon: '⚠️', cls: 'tip-amber' });
    } else if (pct > 0 && pct < 0.5) {
      alerts.push(`
        <div class="alert-item alert-success" role="alert">
          <div class="alert-icon">✅</div>
          <div class="alert-body">
            <div class="alert-type">Great Discipline</div>
            <div class="alert-text">${cat.charAt(0).toUpperCase() + cat.slice(1)} spend is exceptionally low at <strong>${Math.round(pct*100)}%</strong>!</div>
          </div>
        </div>
      `);
      tips.push({ type: 'Savings Opportunity', text: `Excellent discipline with ${cat}! Shift the surplus to your savings.`, icon: '💡', cls: 'tip-blue' });
    }
  });
  
  if (alerts.length === 0) {
    alerts.push('<div style="color:var(--text-muted);font-size:13px;padding:20px;">All budgets are perfectly tracked!</div>');
  }

  if (alertsContainer) alertsContainer.innerHTML = alerts.slice(0, 3).join('');
  if (tipsContainer) {
    if (tips.length === 0) {
      tipsContainer.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:20px;">No new insights. Track more expenses!</div>';
    } else {
      tipsContainer.innerHTML = tips.slice(0, 4).map(t => `<div class="tip-card ${t.cls}"><div class="tip-icon">${t.icon}</div><div class="tip-body"><div class="tip-type">${t.type}</div><div class="tip-text">${t.text}</div></div></div>`).join('');
    }
  }
}

$('refreshTips')?.addEventListener('click', () => {
  updateDynamicAlerts();
  showToast('Insights refreshed from live inputs!', 'info', '✦');
});


let transactions = [];

async function fetchTransactions() {
  try {
    const res = await fetch('http://localhost:5000/api/transactions');
    if (res.ok) {
      transactions = await res.json();
      filteredTx = [...transactions];
      renderTransactions();
      updateDashboardBalance();
      renderBudgetCircles();
      renderBudgetsPage();
      createSpendingChart();
      updateDynamicAlerts();
    } else {
      console.error('Failed to fetch transactions');
      showToast('Error loading transactions.', 'error', '⚠️');
    }
  } catch (error) {
    console.error('Network error while fetching transactions:', error);
    showToast('Could not connect to backend.', 'error', '🔌');
  }
}
fetchTransactions();

const TX_PER_PAGE = 5;
let currentPage = 0;
let filteredTx  = [...transactions];
let currentFilter = 'all';

function filterTransactions() {
  if (currentFilter === 'all') { filteredTx = [...transactions]; return; }
  filteredTx = transactions.filter(t => t.category.toLowerCase().includes(currentFilter));
}

function renderTransactions() {
  filterTransactions();
  const body   = $('txBody');
  const start  = currentPage * TX_PER_PAGE;
  const slice  = filteredTx.slice(start, start + TX_PER_PAGE);
  const total  = Math.ceil(filteredTx.length / TX_PER_PAGE);

  body.innerHTML = slice.map(tx => `
    <tr>
      <td>${tx.desc}</td>
      <td><span class="tx-category ${tx.catClass}">${tx.category}</span></td>
      <td>${tx.date}</td>
      <td class="tx-amount ${tx.type === 'credit' ? 'credit' : 'debit'}">${tx.amount}</td>
      <td>
        <div class="confidence-bar-wrap">
          <div class="confidence-bar"><div class="confidence-fill" style="width:${tx.confidence}%"></div></div>
          <span class="confidence-val">${tx.confidence}%</span>
        </div>
      </td>
      <td><span class="status-badge status-${tx.status}">${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}</span></td>
    </tr>
  `).join('');

  $('pageInfo').textContent = `Page ${currentPage + 1} of ${Math.max(1, total)}`;
  $('prevPage').disabled = currentPage === 0;
  $('nextPage').disabled = currentPage >= total - 1;
}

$('prevPage').addEventListener('click', () => { if (currentPage > 0) { currentPage--; renderTransactions(); } });
$('nextPage').addEventListener('click', () => {
  if ((currentPage + 1) * TX_PER_PAGE < filteredTx.length) { currentPage++; renderTransactions(); }
});

$('txFilter').addEventListener('change', function() {
  currentFilter = this.value;
  currentPage = 0;
  renderTransactions();
  showToast(`Filtered by: ${this.options[this.selectedIndex].text}`, 'info', '🔍');
});

$('exportBtn').addEventListener('click', () => {
  showToast('Exporting transactions as CSV…', 'info', '⤓');
});

$('sortDate').addEventListener('click', () => {
  filteredTx.reverse();
  renderTransactions();
});

/* renderTransactions() is called initially via fetchTransactions() */

/* ============================================================
   SMART BUDGETING CIRCLES (Right Panel)
   ============================================================ */
function renderBudgetCircles() {
  const cont = $('budgetCircles');
  if(!cont) return;
  const budgets = JSON.parse(localStorage.getItem(`axia_cat_budgets_${user.id}`) || '{}');
  
  if (Object.keys(budgets).length === 0) {
    cont.innerHTML = '<div style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px;">No custom budgets set. Click Update Budgets to begin.</div>';
    return;
  }

  const spentMap = {};
  transactions.forEach(tx => {
    if (tx.type === 'debit') {
      const amt = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
      spentMap[tx.category.toLowerCase()] = (spentMap[tx.category.toLowerCase()] || 0) + amt;
    }
  });

  const bData = [
    { label: 'Groceries',    pct: budgets.groceries > 0 ? Math.round(((spentMap['groceries'] || 0) / budgets.groceries) * 100) : 0, color: '#22d3ee' },
    { label: 'Entertainment',pct: budgets.entertainment > 0 ? Math.round(((spentMap['entertainment'] || 0) / budgets.entertainment) * 100) : 0, color: '#3b82f6' },
    { label: 'Dining',       pct: budgets.dining > 0 ? Math.round(((spentMap['dining'] || 0) / budgets.dining) * 100) : 0, color: '#10b981' },
    { label: 'Transport',    pct: budgets.transport > 0 ? Math.round(((spentMap['transport'] || 0) / budgets.transport) * 100) : 0, color: '#8b5cf6' }
  ].map(b => ({ ...b, pct: Math.min(b.pct, 100) }));

  cont.innerHTML = bData.slice(0, 4).map((b, i) => `
    <div class="budget-circle-item">
      <div class="circle-wrap" id="cw${i}">
        <canvas id="circleCanvas${i}" width="70" height="70"></canvas>
        <div class="circle-pct">${b.pct}%<span>used</span></div>
      </div>
      <div class="circle-label">${b.label}</div>
    </div>
  `).join('');

  setTimeout(() => {
    bData.slice(0, 4).forEach((b, i) => {
      const c = $(`circleCanvas${i}`);
      if (c) drawCircle(c, b.pct, b.color);
    });
  }, 60);
}
renderBudgetCircles();

$('budgetWidget').addEventListener('change', () => {
  renderBudgetCircles();
  showToast('Budget view updated.', 'info', '📊');
});

/* ============================================================
   BUDGETS PAGE
   ============================================================ */
function renderBudgetsPage() {
  const grid = $('budgetsGrid');
  if (!grid) return;
  const budgets = JSON.parse(localStorage.getItem(`axia_cat_budgets_${user.id}`) || '{}');

  if (Object.keys(budgets).length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">You have not defined any personal budgets yet. Click Update Budgets to define limits and start seeing dynamic insights.</div>';
    return;
  }

  const spentMap = {};
  transactions.forEach(tx => {
    if (tx.type === 'debit') {
      const amt = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
      spentMap[tx.category.toLowerCase()] = (spentMap[tx.category.toLowerCase()] || 0) + amt;
    }
  });

  const bCats = [
    { icon: '🛒', name: 'Groceries',    budget: budgets.groceries || 0, spent: spentMap['groceries'] || 0, color: '#22d3ee' },
    { icon: '🏠', name: 'Rent',         budget: budgets.rent || 0, spent: spentMap['rent'] || 0, color: '#6366f1' },
    { icon: '🎬', name: 'Entertainment',budget: budgets.entertainment || 0,  spent: spentMap['entertainment'] || 0, color: '#f59e0b' },
    { icon: '🍽️', name: 'Dining',       budget: budgets.dining || 0,  spent: Math.max(spentMap['dining'] || 0, spentMap['dining out'] || 0), color: '#10b981' },
    { icon: '🚗', name: 'Transport',    budget: budgets.transport || 0,  spent: spentMap['transport'] || 0, color: '#8b5cf6' },
    { icon: '💊', name: 'Health',       budget: budgets.health || 0,  spent: Math.max(spentMap['health'] || 0, spentMap['health & fitness'] || 0), color: '#ec4899' },
    { icon: '⚡', name: 'Utilities',    budget: budgets.utilities || 0,  spent: spentMap['utilities'] || 0, color: '#facc15' },
    { icon: '🛍️', name: 'Shopping',     budget: budgets.shopping || 0,  spent: spentMap['shopping'] || 0, color: '#3b82f6' },
  ];

  grid.innerHTML = bCats.map(b => {
    if (b.budget === 0 && b.spent === 0) return '';
    const pct = b.budget > 0 ? Math.round((b.spent / b.budget) * 100) : (b.spent > 0 ? 100 : 0);
    const pctCol = pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : b.color;
    return `
      <div class="budget-card glassmorphism">
        <div class="budget-card-icon">${b.icon}</div>
        <div class="budget-card-name">${b.name}</div>
        <div class="budget-card-meta">₹ ${Math.round(b.spent).toLocaleString('en-IN')} / ₹ ${Math.round(b.budget).toLocaleString('en-IN')}</div>
        <div class="budget-card-bar">
          <div class="budget-card-fill" style="width:${Math.min(pct, 100)}%;background:${pctCol};"></div>
        </div>
        <div class="budget-card-pct" style="color:${pctCol}">${pct}% used</div>
      </div>
    `;
  }).join('');
}

/* ============================================================
   INVESTMENT CHARTS (Dynamic)
   ============================================================ */
let portfolioChart, perfChart;

function initInvestmentCharts() {
  const invTransactions = transactions.filter(t => t.category.toLowerCase().includes('invest') || t.category.toLowerCase().includes('stock') || t.category.toLowerCase().includes('fund'));
  
  const container = qs('#portfolioChart').parentElement;
  if(invTransactions.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:14px;padding:40px;text-align:center;">No investment transactions found. Once you log \'Investment\' expenses, your charts will appear here dynamically.</div>';
    
    const pfCtxCont = qs('#perfChart')?.parentElement;
    if(pfCtxCont) pfCtxCont.innerHTML = '<div style="color:var(--text-muted);font-size:14px;padding:40px;text-align:center;">Performance chart requires user-inputted investment data.</div>';
    
    const invLegend = $('invLegend');
    if (invLegend) invLegend.innerHTML = '';
    return;
  }

  // We actually have data, dynamically render!
  if (portfolioChart && perfChart) return;
  
  const invMap = {};
  invTransactions.forEach(tx => {
    const amt = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
    const cat = tx.description || tx.category;
    invMap[cat] = (invMap[cat] || 0) + amt;
  });

  const pCtx = qs('#portfolioChart')?.getContext('2d');
  if(!pCtx) return;
  const labels = Object.keys(invMap);
  const dataVals = Object.values(invMap);
  const bgColors = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899'];

  portfolioChart = new Chart(pCtx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: dataVals,
        backgroundColor: bgColors.slice(0, labels.length),
        borderColor: '#0f1420', borderWidth: 3, hoverOffset: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,20,32,0.95)', borderColor: 'rgba(255,255,255,0.08)', borderWidth:1,
          padding:10, titleColor:'#f1f5f9', bodyColor:'#94a3b8',
          callbacks: { label: ctx => ` ₹ ${ctx.parsed.toLocaleString('en-IN')}` }
        }
      }
    }
  });

  const invLegend = $('invLegend');
  if (invLegend) {
    invLegend.innerHTML = labels
      .map((l,i) => `<div class="inv-legend-item"><div class="inv-dot" style="background:${bgColors[i % bgColors.length]}"></div>${l}</div>`).join('');
  }

  const pfCtx = qs('#perfChart')?.getContext('2d');
  if(!pfCtx) return;
  const perfData = [];
  let cumInv = 0;
  invTransactions.slice().reverse().forEach(t => {
     cumInv += parseFloat(t.amount.replace(/[^\d.-]/g, ''));
     perfData.push(cumInv * (1 + (Math.random() * 0.05 - 0.01))); // approximate dynamic return for demo based on actual sum
  });

  const grad = pfCtx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, 'rgba(59,130,246,0.3)');
  grad.addColorStop(1, 'rgba(59,130,246,0)');

  perfChart = new Chart(pfCtx, {
    type: 'line',
    data: {
      labels: invTransactions.slice().reverse().map(t => new Intl.DateTimeFormat('en-IN', {month:'short', day:'numeric'}).format(new Date(t.date.split('/').reverse().join('-')))),
      datasets: [{
        label: 'Portfolio Value', data: perfData,
        borderColor: '#3b82f6', borderWidth: 2.5,
        pointBackgroundColor: '#3b82f6', pointRadius: 4,
        tension: 0.4, fill: true, backgroundColor: grad
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(15,20,32,0.95)', borderColor: 'rgba(255,255,255,0.08)', borderWidth:1, padding:10, titleColor:'#f1f5f9', bodyColor:'#94a3b8', callbacks: { label: ctx => ` ₹ ${ctx.parsed.y.toLocaleString('en-IN')}` } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#475569', font: { size: 11 }, callback: v => '₹' + (v/1000).toFixed(0) + 'k' } }
      }
    }
  });
}

/* ============================================================
   GLOBAL SEARCH
   ============================================================ */
let searchDebounce;
$('globalSearch').addEventListener('input', function() {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    const q = this.value.trim().toLowerCase();
    if (!q) { filteredTx = [...transactions]; renderTransactions(); return; }
    filteredTx = transactions.filter(t =>
      t.desc.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.amount.toLowerCase().includes(q)
    );
    currentPage = 0;
    renderTransactions();
    // Auto-switch to dashboard to show results
    showPage('dashboard');
  }, 280);
});

/* ============================================================
   BELL BUTTON
   ============================================================ */
$('bellBtn').addEventListener('click', () => {
  showToast('You have 3 unread alerts from Axia AI.', 'info', '🔔');
});

/* ============================================================
   BALANCE DYNAMICS
   ============================================================ */
function updateDashboardBalance() {
  const el = $('balanceAmount');
  if (!el) return;
  const initialBalance = parseFloat(localStorage.getItem(`axia_balance_${user.id}`) || 0);
  const totalExpenses = transactions.reduce((acc, tx) => {
    const amt = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
    return tx.type === 'debit' ? acc + amt : acc - amt;
  }, 0);
  const currentBalance = initialBalance - totalExpenses;
  
  el.innerHTML = `₹ ${currentBalance.toLocaleString('en-IN')}<span class="balance-decimal">.00</span>`;
  
  // Calculate total explicitly set category budgets
  const budgets = JSON.parse(localStorage.getItem(`axia_cat_budgets_${user.id}`) || '{}');
  const sumBudgets = Object.values(budgets).reduce((a, b) => a + parseFloat(b || 0), 0);

  // Update other dynamic stats
  const spendVal = qs('.stat-value', $('statsCard')?.children[1]);
  if (spendVal) {
    if (sumBudgets > 0) {
      spendVal.innerHTML = `₹ ${totalExpenses.toLocaleString('en-IN')} <span style="font-size: 13px; color: var(--text-muted)">/ ₹ ${sumBudgets.toLocaleString('en-IN')} max</span>`;
    } else {
      spendVal.textContent = `₹ ${totalExpenses.toLocaleString('en-IN')}`;
    }
  }
}

/* ============================================================
   ADD GOAL BUTTON
   ============================================================ */
$('addGoalBtn').addEventListener('click', () => {
  showToast('Goal creation coming soon!', 'info', '🎯');
});

/* ============================================================
   SCROLL BEHAVIOR — sticky active nav highlight
   ============================================================ */
let ticking = false;
$('mainContent')?.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => { ticking = false; });
    ticking = true;
  }
});

/* ============================================================
   INIT
   ============================================================ */
/* ============================================================
   ONBOARDING
   ============================================================ */
const onboardModal = $('onboardingModal');
const onboardForm  = $('onboardingForm');

function checkOnboarding() {
  const balKey = `axia_balance_${user.id}`;
  const budKey = `axia_budget_${user.id}`;
  if (!localStorage.getItem(balKey) || !localStorage.getItem(budKey)) {
    onboardModal.style.display = 'flex';
  } else {
    updateDashboardBalance();
  }
}

onboardForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const bal = $('initBalance').value;
  const bud = $('initBudget').value;
  localStorage.setItem(`axia_balance_${user.id}`, bal);
  localStorage.setItem(`axia_budget_${user.id}`, bud || 52200);
  onboardModal.style.display = 'none';
  showToast('Setup complete! Welcome to Axia.', 'success', '✨');
  updateDashboardBalance();
  renderBudgetCircles();
  renderBudgetsPage();
});

/* ============================================================
   INIT
   ============================================================ */
/* ============================================================
   PREFERENCES & TOGGLES
   ============================================================ */
function initSettings() {
  const dm = $('toggleDarkMode');
  const notif = $('toggleNotifications');
  const ai = $('toggleAI');
  const reports = $('toggleReports');

  // Load saved prefs
  if (localStorage.getItem('axia_dark_mode') === 'true') {
    document.body.classList.add('dark-mode');
    if (dm) dm.checked = true;
  }

  // Listeners
  dm?.addEventListener('change', () => {
    const isDark = dm.checked;
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('axia_dark_mode', isDark);
    showToast(`${isDark ? 'Dark Mode' : 'Royal Blue'} theme activated.`, 'success', '🎨');
  });

  notif?.addEventListener('change', () => showToast(`Notifications ${notif.checked ? 'enabled' : 'disabled'}.`, 'info', '🔔'));
  ai?.addEventListener('change', () => showToast(`AI Suggestions ${ai.checked ? 'on' : 'off'}.`, 'info', '🤖'));
  reports?.addEventListener('change', () => showToast(`Weekly Reports ${reports.checked ? 'scheduled' : 'paused'}.`, 'info', '📧'));
}

/* ============================================================
   INIT
   ============================================================ */
showPage('dashboard');
checkOnboarding();
initSettings();
setTimeout(() => showToast(`Welcome back, ${user.name.split(' ')[0]}! ✦ AI analysis ready.`, 'success', '🚀'), 900);
