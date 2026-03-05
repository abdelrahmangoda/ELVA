import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: "🧠", title: "AI Personalization", desc: "Our AI analyzes your learning style and adapts lessons to match your pace." },
  { icon: "⚡", title: "Interactive Lessons", desc: "Engage with dynamic content that responds to your input." },
  { icon: "🎯", title: "Goal-Oriented", desc: "Define your objectives and let ELVA build the shortest path." },
  { icon: "📊", title: "Progress Tracking", desc: "Visualized analytics show your growth and areas for improvement." },
  { icon: "⏰", title: "On-Demand Access", desc: "Learn anytime, anywhere. Your AI tutor is always ready." },
  { icon: "👥", title: "Community Learning", desc: "Connect with others and share resources and insights." }
];

const steps = [
  { num: "1", title: "Create Your Profile", desc: "Sign up and personalize your avatar in seconds." },
  { num: "2", title: "Tell ELVA What to Learn", desc: "Just type any topic you want to master." },
  { num: "3", title: "Interactive Lessons", desc: "Get personalized slides, examples, and explanations." },
  { num: "4", title: "Quiz & Progress", desc: "Test your knowledge and track your improvement." }
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            NEW: AI-POWERED PERSONALIZED LEARNING
          </div>
          
          <h1 className="hero-title">
            Meet ELVA — Your Personal<br />
            <span className="gradient-text">AI Learning Companion</span>
          </h1>
          
          <p className="hero-subtitle">
            Through real-time adaptation, personalized lessons, and intelligent feedback, 
            ELVA transforms learning into a deeply human experience. It understands you, 
            evolves with your style, and makes every study session smarter.
          </p>
          
          <div className="hero-cta">
            {isAuthenticated ? (
              <Link to="/learn" className="btn-primary large">
                🚀 Start Learning Now
              </Link>
            ) : (
              <>
                <Link to="/auth?mode=signup" className="btn-primary large">
                  Get Started Free
                </Link>
                <Link to="/auth?mode=login" className="btn-secondary large">
                  Login
                </Link>
              </>
            )}
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">10M+</span>
              <span className="stat-label">Learners</span>
            </div>
            <div className="stat">
              <span className="stat-number">500K+</span>
              <span className="stat-label">Lessons</span>
            </div>
            <div className="stat">
              <span className="stat-number">4.9</span>
              <span className="stat-label">Rating</span>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="hero-card">
            <div className="card-header">
              <div className="card-dot"></div>
              <span>ELVA AI Tutor</span>
            </div>
            <div className="card-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
              <p>Generating your personalized learning path...</p>
            </div>
          </div>
          
          <div className="floating-badge top">
            ✅ Mastered Python Basics
          </div>
          <div className="floating-badge bottom">
            🎯 Next: Data Structures
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="partners-section">
        <div className="partners-track">
          {['OpenAI', 'Microsoft', 'Google', 'Khan Academy', 'Meta', 'NVIDIA', 'OpenAI', 'Microsoft', 'Google', 'Khan Academy', 'Meta', 'NVIDIA'].map((partner, i) => (
            <span key={i} className="partner-name">{partner}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Everything You Need to Master Any Topic</h2>
          <p>ELVA combines the power of LLMs with pedagogical research for the most effective learning.</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-section">
        <div className="section-header">
          <h2>How ELVA Works</h2>
          <p>Four simple steps to transform your learning experience.</p>
        </div>
        
        <div className="steps-grid">
          {steps.map((step, i) => (
            <div key={i} className="step-card">
              <div className="step-number">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join millions of learners who have already transformed their education with ELVA AI.</p>
          
          <div className="cta-buttons">
            {isAuthenticated ? (
              <Link to="/learn" className="btn-primary large">
                🚀 Continue Learning
              </Link>
            ) : (
              <Link to="/auth?mode=signup" className="btn-primary large">
                Create Free Account
              </Link>
            )}
          </div>
          
          <div className="cta-features">
            <span>✓ No credit card required</span>
            <span>✓ All features included</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </section>
    </div>
  );
}