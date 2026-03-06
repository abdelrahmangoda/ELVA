import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">E</div>
              <span className="logo-name">ELVA</span>
            </div>
            <p className="footer-desc">
              AI-driven educational platform that adapts to you. 
              Learn anything, anywhere, anytime with your personal AI tutor.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link">𝕏</a>
              <a href="#" className="social-link">in</a>
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">📸</a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Platform</h4>
            <Link to="/learn">Start Learning</Link>
            <a href="#">Courses</a>
            <a href="#">Learning Paths</a>
            <a href="#">Resources</a>
          </div>

          <div className="footer-links">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Community</a>
            <a href="#">Contact Us</a>
            <a href="#">FAQ</a>
          </div>

          <div className="footer-links">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>

          <div className="footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Get the latest AI learning tips and updates.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" />
              <button>→</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 ELVA Learning. All rights reserved.</p>
          <div className="footer-badges">
            <span>🔒 Secure</span>
            <span>🌍 Global</span>
            <span>🆓 Free to Start</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
