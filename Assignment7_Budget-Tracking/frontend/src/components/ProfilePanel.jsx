import { useNavigate } from 'react-router-dom';

const ProfilePanel = ({ isOpen, user, onClose, onLogout }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AR';
  };

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className={`profile-panel glassmorphism ${isOpen ? 'open' : ''}`}>
      <div className="profile-panel-header">
        <div className="profile-avatar-lg">{getInitials(user.name)}</div>
        <div>
          <div className="profile-name-lg">{user.name}</div>
          <div className="profile-email">{user.email || 'alex@example.com'}</div>
        </div>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
      <hr className="panel-divider" />
      <ul className="profile-menu">
        <li><button className="profile-menu-item" onClick={() => handleNav('/profile')}><span>👤</span> Edit Profile</button></li>
        <li><button className="profile-menu-item" onClick={() => handleNav('/profile')}><span>⚙️</span> Settings</button></li>
        <li><button className="profile-menu-item"><span>🔔</span> Notifications</button></li>
        <li><button className="profile-menu-item"><span>🛡️</span> Security Center</button></li>
        <li><button className="profile-menu-item danger" onClick={onLogout}><span>🚪</span> Logout</button></li>
      </ul>
      <div className="profile-panel-footer">
        <span className="badge-encrypted">🔒 End-to-End Encrypted</span>
      </div>
    </div>
  );
};

export default ProfilePanel;
