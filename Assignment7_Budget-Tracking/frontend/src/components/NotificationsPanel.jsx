import React from 'react';

const NotificationsPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifications = [
    { id: 1, type: 'alert', title: 'Budget Limit Exceeded', desc: 'You have spent more than ₹10,000 on Shopping.', time: '2m ago', icon: '🛑' },
    { id: 2, type: 'insight', title: 'New AI Insight', desc: 'Move ₹5,000 to your savings for 8.2% growth.', time: '1h ago', icon: '✦' },
    { id: 3, type: 'success', title: 'Income Received', desc: 'Your monthly salary of ₹80,000 has been credited.', time: 'Today', icon: '💰' },
  ];

  return (
    <>
      <div className="modal-overlay" onClick={onClose} style={{ pointerEvents: 'auto', background: 'transparent' }}></div>
      <div className={`notification-panel glassmorphism ${isOpen ? 'open' : ''}`} style={{
        position: 'absolute',
        top: '70px',
        right: '80px',
        width: '320px',
        maxHeight: '400px',
        zIndex: 1000,
        padding: '20px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        animation: 'slideIn 0.3s ease-out'
      }}>
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Notifications</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
        </div>
        <div className="notification-list" style={{ overflowY: 'auto', maxHeight: '300px' }}>
          {notifications.map(n => (
            <div key={n.id} style={{ 
              padding: '12px', 
              borderRadius: '12px', 
              backgroundColor: 'rgba(255,255,255,0.03)', 
              marginBottom: '10px',
              display: 'flex',
              gap: '12px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'} 
               onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}>
              <div style={{ fontSize: '20px' }}>{n.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{n.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.desc}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="panel-footer" style={{ textAlign: 'center', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
          <button style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>Mark all as read</button>
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;
