import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ProfilePanel from './ProfilePanel';
import NotificationsPanel from './NotificationsPanel';
import AddExpenseModal from './Modals/AddExpenseModal';
import SetBudgetsModal from './Modals/SetBudgetsModal';
import UpdateIncomeModal from './Modals/UpdateIncomeModal';
import { useUI } from '../context/UIContext';

const Layout = ({ children, user, setUser }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { 
    isExpenseModalOpen, closeExpenseModal, 
    isBudgetModalOpen, closeBudgetModal,
    isIncomeModalOpen, openIncomeModal, closeIncomeModal
  } = useUI();

  const handleLogout = () => {
    localStorage.removeItem('axia_token');
    localStorage.removeItem('axia_user');
    setUser(null);
  };

  return (
    <div className="app-shell">
      <Sidebar 
        user={user} 
      />
      
      <main className="main-content">
        <Topbar 
          user={user} 
          toggleProfile={() => { setProfileOpen(!profileOpen); setNotificationOpen(false); }} 
          toggleNotifications={() => { setNotificationOpen(!notificationOpen); setProfileOpen(false); }}
        />
        {children}
      </main>

      <ProfilePanel 
        isOpen={profileOpen} 
        user={user} 
        onClose={() => setProfileOpen(false)} 
        onLogout={handleLogout} 
      />

      <NotificationsPanel 
        isOpen={notificationOpen} 
        onClose={() => setNotificationOpen(false)} 
      />

      {isExpenseModalOpen && (
        <AddExpenseModal onClose={closeExpenseModal} />
      )}

      {isBudgetModalOpen && (
        <SetBudgetsModal onClose={closeBudgetModal} user={user} />
      )}

      {isIncomeModalOpen && (
        <UpdateIncomeModal 
          onClose={closeIncomeModal} 
          user={user} 
          setUser={setUser} 
        />
      )}

      <div className="toast-container" id="toastContainer"></div>
    </div>
  );
};

export default Layout;
