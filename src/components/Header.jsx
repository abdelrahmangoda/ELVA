// src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { buildMiniAvatarSVG } from './AvatarCreator';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <div className="logo-icon">E</div>
          <div className="logo-text">
            <span className="logo-name">ELVA</span>
            <span className="logo-sub">AI Learning</span>
          </div>
        </Link>

        <nav className="header-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          {isAuthenticated && (
            <Link to="/learn" className={`nav-link ${isActive('/learn') ? 'active' : ''}`}>
              🚀 Start Learning
            </Link>
          )}
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it Works</a>
        </nav>

        <div className="header-actions">
          {/* Theme Toggle */}
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {isAuthenticated ? (
            <>
              <div className="user-stats">
                <span className="stat-pill">⭐ {user.xp || 0} XP</span>
                <span className="stat-pill">🔥 {user.streak || 0}</span>
              </div>
              <div className="user-menu-wrapper">
                <button 
                  className="user-avatar-btn"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {user.avatar ? (
                    <div 
                      className="avatar-mini"
                      dangerouslySetInnerHTML={{ __html: buildMiniAvatarSVG(user.avatar, 40) }}
                    />
                  ) : (
                    <span className="avatar-placeholder">
                      {user.firstName?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </button>
                {menuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <span className="dropdown-name">{user.firstName} {user.lastName}</span>
                      <span className="dropdown-email">{user.email}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      📊 Dashboard
                    </Link>
                    <Link 
                      to="/learn" 
                      className="dropdown-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      📚 My Learning
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/auth?mode=login" className="btn-secondary">
                Login
              </Link>
              <Link to="/auth?mode=signup" className="btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          {isAuthenticated && (
            <Link to="/learn" onClick={() => setMenuOpen(false)}>🚀 Start Learning</Link>
          )}
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it Works</a>
          <button className="mobile-theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>📊 Dashboard</Link>
              <button onClick={handleLogout} className="mobile-logout">🚪 Logout</button>
            </>
          ) : (
            <>
              <Link to="/auth?mode=login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/auth?mode=signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}