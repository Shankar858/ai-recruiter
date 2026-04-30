import React, { useState } from 'react';
import { BrainCircuit, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface Props {
  onLogin: (user: { name: string; role: string }) => void;
  onToggleSignUp: () => void;
}

const DEMO_USERS = [
  { email: 'admin@recruit.ai', password: 'admin123', name: 'Admin User', role: 'HR Manager' },
  { email: 'recruiter@recruit.ai', password: 'recruit123', name: 'Jane Recruiter', role: 'Recruiter' },
];

const Login: React.FC<Props> = ({ onLogin, onToggleSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      // Check hardcoded demo users
      let user = DEMO_USERS.find(u => u.email === email && u.password === password);
      
      // If not found, check localStorage for registered users
      if (!user) {
        const registeredUsers = JSON.parse(localStorage.getItem('ai_recruiter_users') || '[]');
        user = registeredUsers.find((u: any) => u.email === email && u.password === password);
      }

      if (user) {
        onLogin({ name: user.name, role: user.role });
      } else {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="login-page">
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-card">
        <div className="login-logo">
          <BrainCircuit size={44} style={{ color: 'var(--accent-blue)' }} />
          <h1>AI Recruiter</h1>
          <p>Premium Resume Intelligence & Ranking System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>Welcome Back</h2>
          {error && <div className="login-error">{error}</div>}

          <div className="login-field">
            <label>Email Address</label>
            <div className="login-input-wrap">
              <Mail size={16} className="field-icon" />
              <input type="email" placeholder="admin@recruit.ai" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="login-input-wrap">
              <Lock size={16} className="field-icon" />
              <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <button 
            onClick={onToggleSignUp}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-blue)', 
              cursor: 'pointer', 
              fontWeight: '600',
              padding: 0
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
