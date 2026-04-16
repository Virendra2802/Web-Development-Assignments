import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/login' : '/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await axios.post(`http://localhost:5000/api/auth${endpoint}`, payload);
      if (res.data.token) {
        localStorage.setItem('axia_token', res.data.token);
        localStorage.setItem('axia_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate('/');
      } else {
        setError(res.data.msg || 'Action failed');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Server error');
    }
  };

  return (
    <div style={{
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: 'var(--bg-deep)'
    }}>
      <div className="card glassmorphism" style={{ width: '400px', padding: '40px' }}>
        <h2 className="modal-title" style={{ textAlign: 'center', marginBottom: '20px' }}>
          {isLogin ? 'Axia Login' : 'Axia Sign Up'}
        </h2>
        
        {error && <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
        
        <form onSubmit={handleSubmit} className="expense-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Alex R."
                required 
              />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="alex@example.com"
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '20px', width: '100%' }}>
            {isLogin ? 'Login to Dashboard' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isLogin ? (
            <>
              Don't have an account? {' '}
              <button 
                onClick={() => setIsLogin(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: '600' }}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account? {' '}
              <button 
                onClick={() => setIsLogin(true)} 
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: '600' }}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
