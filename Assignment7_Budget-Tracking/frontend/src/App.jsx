import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import Investments from './pages/Investments';
import Profile from './pages/Profile';
import Login from './pages/Login';
import './index.css';

import { UIProvider } from './context/UIContext';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('axia_user');
    const token = localStorage.getItem('axia_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <UIProvider>
      <Router>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
          <Route
            path="/*"
            element={
              user ? (
                <Layout user={user} setUser={setUser}>
                  <Routes>
                    <Route path="/" element={<Dashboard user={user} />} />
                    <Route path="/budgets" element={<Budgets user={user} />} />
                    <Route path="/investments" element={<Investments user={user} />} />
                    <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Router>
    </UIProvider>
  );
}

export default App;
