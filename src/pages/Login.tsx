import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Fake login
    console.log('Logging in with', email, password);
    navigate('/');
  };

  return (
    <div className="container flex-center animate-fade-in" style={{ minHeight: '80vh', marginTop: '70px' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 600 }}>Welcome Back</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Log in to continue renting</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                <Mail size={18} />
              </div>
              <input 
                id="email"
                type="email" 
                className="input-field" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
              <label className="input-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
              <a href="#" style={{ fontSize: '0.875rem', color: 'var(--color-primary)' }}>Forgot password?</a>
            </div>
            <div style={{ position: 'relative' }}>
               <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                <Lock size={18} />
              </div>
              <input 
                id="password"
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <Button type="submit" fullWidth size="lg">
            Sign In
            <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
