import { useState } from 'react';
import axios from 'axios';
import { useUI } from '../context/UIContext';

const Profile = ({ user, setUser }) => {
  const { isDarkMode, toggleDarkMode } = useUI();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [curr, setCurr] = useState('INR');
  const [budgetDate, setBudgetDate] = useState('1st');

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AR';
  };

  const handleSave = async () => {
    try {
      const res = await axios.put('http://localhost:5000/api/auth/profile', {
        userId: user.id || user._id,
        name,
        email
      });
      setUser(res.data);
      localStorage.setItem('axia_user', JSON.stringify(res.data));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Error updating profile.");
    }
  };

  return (
    <div className="page-content">
      <div className="page-hero">
        <h1 className="page-title">Profile & Settings</h1>
        <p className="page-desc">Manage your account identity, security, and global preferences.</p>
      </div>

      <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* 1. User Profile */}
        <div className="card glassmorphism profile-info-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{color: 'var(--accent-blue)'}}>👤</span> User Identity
          </div>
          <div className="profile-avatar-xl" style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}>{getInitials(user.name)}</div>
          <div className="profile-details">
            {isEditing ? (
              <>
                 <div className="pd-row"><span className="pd-label">Name</span><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="quick-input" style={{width: '100%', padding: '6px 12px', background: 'var(--bg-input)'}} autoFocus /></div>
                 <div className="pd-row"><span className="pd-label">Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="quick-input" style={{width: '100%', padding: '6px 12px', background: 'var(--bg-input)'}} /></div>
              </>
            ) : (
              <>
                <div className="pd-row"><span className="pd-label">Name</span><span className="pd-value">{user.name}</span></div>
                <div className="pd-row"><span className="pd-label">Email</span><span className="pd-value">{user.email || 'N/A'}</span></div>
              </>
            )}
            <div className="pd-row"><span className="pd-label">Member Since</span><span className="pd-value">Jan 2026</span></div>
          </div>
          {isEditing ? (
            <div style={{display: 'flex', gap: '8px', marginTop: '16px', width: '100%'}}>
              <button onClick={() => setIsEditing(false)} className="btn-secondary" style={{flex: 1}}>Cancel</button>
              <button onClick={handleSave} className="btn-primary" style={{flex: 1}}>Save</button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn-secondary mt-1" style={{ width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>Edit Profile</button>
          )}
        </div>

        {/* 2. Security */}
        <div className="card glassmorphism">
          <div className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{color: '#10b981'}}>🛡️</span> Security Center
          </div>
          <p style={{fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px'}}>
            Protect your financial data with multiple layers of authentication.
          </p>
          
          <div className="pref-list" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div className="pref-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <span style={{fontWeight: 'bold', color: 'var(--text-primary)'}}>Two-Factor Authentication (2FA)</span>
                <span style={{fontSize: '11px', color: 'var(--text-muted)'}}>Add an extra layer of security via SMS.</span>
              </div>
              <label className="toggle"><input type="checkbox" /><span className="toggle-slider"></span></label>
            </div>
            
            <button className="btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 1))', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}>
              Change Master Password
            </button>
          </div>
        </div>

        {/* 3. Preferences */}
        <div className="card glassmorphism">
          <div className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{color: '#f59e0b'}}>⚙️</span> System Preferences
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label style={{color: 'var(--text-secondary)'}}>Global Currency</label>
              <select value={curr} onChange={(e) => setCurr(e.target.value)} className="quick-input" style={{width: '100%', background: 'var(--bg-input)', cursor: 'pointer'}}>
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label style={{color: 'var(--text-secondary)'}}>Default Budget Start Date</label>
              <select value={budgetDate} onChange={(e) => setBudgetDate(e.target.value)} className="quick-input" style={{width: '100%', background: 'var(--bg-input)', cursor: 'pointer'}}>
                <option value="1st">1st of the Month</option>
                <option value="15th">15th of the Month</option>
                <option value="last">Last Day of Month</option>
              </select>
            </div>

            <div className="pref-item" style={{ marginTop: '4px' }}>
              <span>🌙 Dark Mode Interface</span>
              <label className="toggle"><input type="checkbox" checked={isDarkMode} onChange={toggleDarkMode} /><span className="toggle-slider"></span></label>
            </div>
          </div>
        </div>

        {/* 4. Notifications */}
        <div className="card glassmorphism">
          <div className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{color: '#8b5cf6'}}>🔔</span> Notification Routing
          </div>
          <p style={{fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px'}}>
            Stay on top of your financial thresholds without getting spammed.
          </p>

          <div className="pref-list" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <label style={{display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px'}}>
              <input type="checkbox" defaultChecked style={{width: '18px', height: '18px', accentColor: 'var(--accent-blue)'}} />
              <div>
                <div style={{fontWeight: '600', color: 'var(--text-primary)'}}>Budget High-Alerts</div>
                <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>Notify me when spending hits 90% of budget.</div>
              </div>
            </label>

            <label style={{display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px'}}>
              <input type="checkbox" defaultChecked style={{width: '18px', height: '18px', accentColor: 'var(--accent-blue)'}} />
              <div>
                <div style={{fontWeight: '600', color: 'var(--text-primary)'}}>AI Weekly Summaries</div>
                <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>Receive weekend recap analysis to my email.</div>
              </div>
            </label>

            <label style={{display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px'}}>
              <input type="checkbox" style={{width: '18px', height: '18px', accentColor: 'var(--accent-blue)'}} />
              <div>
                <div style={{fontWeight: '600', color: 'var(--text-primary)'}}>Investment Margin Call</div>
                <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>Notify when portfolio drops beyond standard deviation.</div>
              </div>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
