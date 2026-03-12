import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Fake signup
    console.log('Signing up', name, email);
    navigate('/');
  };

  return (
    <div className="container flex-center animate-fade-in" style={{ minHeight: '80vh', marginTop: '70px' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 600 }}>Create Account</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Join the P2P clothing rental community</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label className="input-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                <User size={18} />
              </div>
              <input 
                id="name"
                type="text" 
                className="input-field" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

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
            <label className="input-label" htmlFor="password">Password</label>
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
            Create Account
            <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
