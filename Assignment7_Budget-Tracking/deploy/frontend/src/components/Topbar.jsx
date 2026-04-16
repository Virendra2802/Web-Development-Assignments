import { useLocation } from 'react-router-dom';

const Topbar = ({ user, toggleProfile, toggleNotifications }) => {
  const location = useLocation();
  
  const getBreadcrumb = () => {
    const paths = {
      '/': 'Dashboard',
      '/budgets': 'Budgets',
      '/investments': 'Investments',
      '/profile': 'Profile & Settings'
    };
    return paths[location.pathname] || 'Dashboard';
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AR';
  };

  const today = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="breadcrumb">
          <span className="breadcrumb-root">Axia Finance</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{getBreadcrumb()}</span>
        </div>
        <div className="topbar-date">{today}</div>
      </div>
      <div className="topbar-right">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search transactions, budgets…" className="search-input" />
        </div>
        <button className="icon-btn bell-btn" aria-label="Notifications" onClick={toggleNotifications}>
          🔔
          <span className="notification-dot"></span>
        </button>
        <div className="topbar-profile" onClick={toggleProfile}>
          <div className="avatar-sm">{getInitials(user.name)}</div>
          <span className="topbar-name">{user.name}</span>
          <span className="topbar-chevron">▾</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
