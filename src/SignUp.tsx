import React, { useState } from 'react';
import { BrainCircuit, Mail, Lock, Eye, EyeOff, User, Briefcase } from 'lucide-react';

interface Props {
  onSignUp: (user: { name: string; role: string }) => void;
  onToggleLogin: () => void;
}

const SignUp: React.FC<Props> = ({ onSignUp, onToggleLogin }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('HR Manager');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate sign up and save to localStorage for login persistence
    setTimeout(() => {
      const existingUsers = JSON.parse(localStorage.getItem('ai_recruiter_users') || '[]');
      
      // Check if email already exists
      if (existingUsers.some((u: any) => u.email === email)) {
        alert('This email is already registered. Please sign in or use a different email.');
        setLoading(false);
        return;
      }

      const newUser = { email, password, name, role };
      localStorage.setItem('ai_recruiter_users', JSON.stringify([...existingUsers, newUser]));
      
      onSignUp({ name, role });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="login-page">
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-card">
        <div className="login-logo">
          <BrainCircuit size={44} style={{ color: 'var(--accent-blue)' }} />
          <h1>AI Recruiter</h1>
          <p>Create your professional account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>Sign Up</h2>

          <div className="login-field">
            <label>Full Name</label>
            <div className="login-input-wrap">
              <User size={16} className="field-icon" />
              <input 
                type="text" 
                placeholder="John Doe" 
                value={name}
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="login-field">
            <label>Role</label>
            <div className="login-input-wrap">
              <Briefcase size={16} className="field-icon" />
              <select 
                value={role}
                onChange={e => setRole(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  padding: '12px 44px',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="HR Manager">HR Manager</option>
                <option value="Recruiter">Recruiter</option>
                <option value="Hiring Manager">Hiring Manager</option>
              </select>
            </div>
          </div>

          <div className="login-field">
            <label>Email Address</label>
            <div className="login-input-wrap">
              <Mail size={16} className="field-icon" />
              <input 
                type="email" 
                placeholder="john@example.com" 
                value={email}
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="login-input-wrap">
              <Lock size={16} className="field-icon" />
              <input 
                type={showPw ? 'text' : 'password'} 
                placeholder="••••••••"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
              <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <button 
            onClick={onToggleLogin}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-blue)', 
              cursor: 'pointer', 
              fontWeight: '600',
              padding: 0
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
