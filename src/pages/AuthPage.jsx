import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AvatarCreator from '../components/AvatarCreator';

const EDUCATION_YEARS = [
  "Elementary School",
  "Middle School",
  "High School - Year 1",
  "High School - Year 2",
  "High School - Year 3",
  "University - Year 1",
  "University - Year 2",
  "University - Year 3",
  "University - Year 4",
  "Graduate School",
  "Professional / Self-Learning"
];

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  
  const [mode, setMode] = useState(searchParams.get('mode') || 'login');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '',
    education: '',
    gender: 'male',
    avatar: null
  });

  useEffect(() => {
    setMode(searchParams.get('mode') || 'login');
    setStep(1);
    setError('');
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid email or password');
    }
    
    setLoading(false);
  };

  const handleSignupStep1 = (e) => {
    e.preventDefault();
    
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setError('');
    setStep(2);
  };

  const handleSignupStep2 = (e) => {
    e.preventDefault();
    
    if (!formData.age || formData.age < 5 || formData.age > 120) {
      setError('Please enter a valid age');
      return;
    }
    if (!formData.education) {
      setError('Please select your education level');
      return;
    }
    
    setError('');
    setStep(3);
  };

  const handleAvatarSave = (avatarData) => {
    setFormData(prev => ({ ...prev, avatar: avatarData }));
    setStep(4);
  };

  const handleCompleteSignup = () => {
    setLoading(true);
    
    const user = signup({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      age: parseInt(formData.age),
      education: formData.education,
      gender: formData.gender,
      avatar: formData.avatar
    });
    
    if (user) {
      navigate('/');
    } else {
      setError('Failed to create account');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">E</div>
            <span>ELVA</span>
          </div>
          
          {mode === 'login' ? (
            <>
              <h1>Welcome Back!</h1>
              <p>Login to continue your learning journey</p>
            </>
          ) : (
            <>
              <h1>Create Account</h1>
              <p>
                {step === 1 && "Let's start with your basic info"}
                {step === 2 && "Tell us about yourself"}
                {step === 3 && "Create your avatar"}
                {step === 4 && "You're all set!"}
              </p>
              
              {step < 4 && (
                <div className="signup-progress">
                  <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
                  <div className="progress-line"></div>
                  <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
                  <div className="progress-line"></div>
                  <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
                </div>
              )}
            </>
          )}
        </div>

        {error && <div className="auth-error">{error}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>
            
            <button type="submit" className="btn-primary full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <p className="auth-switch">
              Don't have an account?{' '}
              <button type="button" onClick={() => navigate('/auth?mode=signup')}>
                Sign up
              </button>
            </p>
          </form>
        ) : (
          <>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <form onSubmit={handleSignupStep1} className="auth-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>
                
                <button type="submit" className="btn-primary full">
                  Continue →
                </button>
                
                <p className="auth-switch">
                  Already have an account?{' '}
                  <button type="button" onClick={() => navigate('/auth?mode=login')}>
                    Login
                  </button>
                </p>
              </form>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <form onSubmit={handleSignupStep2} className="auth-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="18"
                      min="5"
                      max="120"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <div className="gender-select">
                      <button
                        type="button"
                        className={formData.gender === 'male' ? 'active' : ''}
                        onClick={() => setFormData(p => ({ ...p, gender: 'male' }))}
                      >
                        👨 Male
                      </button>
                      <button
                        type="button"
                        className={formData.gender === 'female' ? 'active' : ''}
                        onClick={() => setFormData(p => ({ ...p, gender: 'female' }))}
                      >
                        👩 Female
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Education Level</label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select your level...</option>
                    {EDUCATION_YEARS.map((level, i) => (
                      <option key={i} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-buttons">
                  <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button type="submit" className="btn-primary">
                    Continue →
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Avatar Creation */}
            {step === 3 && (
              <div className="avatar-step">
                <AvatarCreator
                  initialAvatar={formData.avatar || { gender: formData.gender }}
                  onSave={handleAvatarSave}
                  isModal={false}
                  showFaceScan={true}
                />
                
                <div className="form-buttons">
                  <button className="btn-secondary" onClick={() => setStep(2)}>
                    ← Back
                  </button>
                  <button className="btn-ghost" onClick={() => handleAvatarSave(null)}>
                    Skip for now
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {step === 4 && (
              <div className="complete-step">
                <div className="complete-icon">🎉</div>
                <h2>Welcome, {formData.firstName}!</h2>
                <p>Your account is ready. Let's start learning!</p>
                
                <button 
                  className="btn-primary full large"
                  onClick={handleCompleteSignup}
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : '🚀 Start Learning'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}