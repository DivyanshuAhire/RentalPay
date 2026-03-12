import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './Button';
import { Shirt, User, PlusCircle } from 'lucide-react';
import './navbar.css';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = React.useState(false);
  
  // Fake auth state for UI purposes
  const isAuthenticated = false; 

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled glass-panel' : ''}`}>
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo flex-center">
          <div className="logo-icon">
            <Shirt size={24} color="white" />
          </div>
          <span className="logo-text text-gradient">RentIt</span>
        </Link>
        
        <div className="navbar-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Explore
          </Link>
          <Link 
            to="/add-item" 
            className={`nav-link ${location.pathname === '/add-item' ? 'active' : ''}`}
          >
            <PlusCircle size={18} className="nav-icon" />
            Lend Clothes
          </Link>
        </div>
        
        <div className="navbar-actions">
          {isAuthenticated ? (
            <Link to="/profile">
              <div className="avatar">
                <User size={20} />
              </div>
            </Link>
          ) : (
            <>
              <Link to="/login" className="login-link">
                Login
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
