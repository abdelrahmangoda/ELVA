// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: "🧠", title: "AI Personalization", desc: "Our AI analyzes your learning style and adapts lessons to match your pace and preferences." },
  { icon: "⚡", title: "Interactive Lessons", desc: "Engage with dynamic content that responds to your input and keeps you motivated." },
  { icon: "🎯", title: "Goal-Oriented", desc: "Define your objectives and let ELVA build the shortest path to mastery." },
  { icon: "📊", title: "Progress Tracking", desc: "Visualized analytics show your growth and highlight areas for improvement." },
  { icon: "⏰", title: "On-Demand Access", desc: "Learn anytime, anywhere. Your AI tutor is always ready when you are." },
  { icon: "👥", title: "Community Learning", desc: "Connect with other learners and share resources, tips, and insights." }
];

const steps = [
  { num: "1", title: "Create Your Profile", desc: "Sign up and personalize your learning experience in seconds." },
  { num: "2", title: "Tell ELVA What to Learn", desc: "Simply type any topic you want to master—any subject, any level." },
  { num: "3", title: "Interactive Lessons", desc: "Get personalized slides, examples, and step-by-step explanations." },
  { num: "4", title: "Quiz & Progress", desc: "Test your knowledge and track your improvement over time." }
];

const testimonials = [
  { name: "Sarah M.", role: "University Student", text: "ELVA helped me understand complex physics concepts that I struggled with for months!", avatar: "👩‍🎓" },
  { name: "Ahmed K.", role: "High School Student", text: "The AI adapts perfectly to my level. It's like having a personal tutor 24/7.", avatar: "👨‍🎓" },
  { name: "Lisa T.", role: "Self-Learner", text: "I learned Python programming from scratch in just 3 weeks with ELVA!", avatar: "👩‍💻" }
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
            Meet <span className="gradient-text">ELVA</span>
            <br />
            Your Personal AI Learning Companion
          </h1>
          
          <p className="hero-subtitle">
            Through real-time adaptation, personalized lessons, and intelligent feedback, 
            ELVA transforms learning into a deeply engaging experience. It understands you, 
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
              <span className="stat-label">Active Learners</span>
            </div>
            <div className="stat">
              <span className="stat-number">500K+</span>
              <span className="stat-label">Lessons Created</span>
            </div>
            <div className="stat">
              <span className="stat-number">4.9</span>
              <span className="stat-label">User Rating</span>
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
          <span className="section-badge">Features</span>
          <h2>Everything You Need to Master Any Topic</h2>
          <p>ELVA combines the power of advanced AI with proven pedagogical research to deliver the most effective and engaging learning experience.</p>
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
          <span className="section-badge">Process</span>
          <h2>How ELVA Works</h2>
          <p>Four simple steps to transform your learning experience forever.</p>
        </div>
        
        <div className="steps-grid">
          {steps.map((step, i) => (
            <div key={i} className="step-card">
              <div className="step-number">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              {i < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <span className="section-badge">Testimonials</span>
          <h2>Loved by Learners Worldwide</h2>
          <p>See what our students have to say about their experience with ELVA.</p>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-content">
                <p>"{t.text}"</p>
              </div>
              <div className="testimonial-author">
                <span className="author-avatar">{t.avatar}</span>
                <div className="author-info">
                  <span className="author-name">{t.name}</span>
                  <span className="author-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Learning Journey?</h2>
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