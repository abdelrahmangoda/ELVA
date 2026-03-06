// src/components/Dashboard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { buildAvatarSVG } from './AvatarCreator';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const xpToNextLevel = 100 - (user.xp % 100);
  const progressPercent = ((user.xp % 100) / 100) * 100;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    { icon: '⭐', label: 'Total XP', value: user.xp || 0, color: '#fbbf24' },
    { icon: '🔥', label: 'Day Streak', value: user.streak || 0, color: '#ef4444' },
    { icon: '📚', label: 'Lessons', value: user.lessonsCompleted || 0, color: '#3b82f6' },
    { icon: '🎯', label: 'Quizzes', value: user.quizzesCompleted || 0, color: '#10b981' },
  ];

  const recentActivities = user.recentActivity || [];

  const achievements = [
    { icon: '🎓', name: 'First Lesson', desc: 'Complete your first lesson', unlocked: (user.lessonsCompleted || 0) >= 1 },
    { icon: '🔥', name: 'Week Streak', desc: 'Maintain a 7-day streak', unlocked: (user.streak || 0) >= 7 },
    { icon: '💯', name: 'Quiz Master', desc: 'Complete 10 quizzes', unlocked: (user.quizzesCompleted || 0) >= 10 },
    { icon: '⭐', name: 'XP Champion', desc: 'Earn 1000 XP', unlocked: (user.xp || 0) >= 1000 },
    { icon: '📖', name: 'Bookworm', desc: 'Complete 25 lessons', unlocked: (user.lessonsCompleted || 0) >= 25 },
    { icon: '🏆', name: 'Elite Learner', desc: 'Reach Level 10', unlocked: (user.level || 1) >= 10 },
  ];

  // Navigate to profile settings
  const goToProfileSettings = () => {
    navigate('/profile?view=settings');
  };

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div className="welcome-left">
          <div className="welcome-avatar">
            {user.avatar ? (
              <div dangerouslySetInnerHTML={{ __html: buildAvatarSVG(user.avatar, 80) }} />
            ) : (
              <div className="avatar-placeholder-dash">
                {user.firstName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="welcome-text">
            <p className="welcome-greeting">{getGreeting()},</p>
            <h2 className="welcome-name">{user.firstName}! 👋</h2>
            <p className="welcome-level">Level {user.level || 1} Learner</p>
            <p className="welcome-education">
              {user.education}
              {user.educationYear && ` - ${user.educationYear}`}
              {user.schoolName && ` at ${user.schoolName}`}
              {user.faculty && `, ${user.faculty}`}
            </p>
          </div>
        </div>
        <div className="welcome-right">
          <Link to="/learn" className="btn-primary">
            🚀 Continue Learning
          </Link>
        </div>
      </div>

      {/* XP Progress */}
      <div className="dashboard-xp-card">
        <div className="xp-info">
          <span className="xp-current">⭐ {user.xp || 0} XP</span>
          <span className="xp-next">{xpToNextLevel} XP to Level {(user.level || 1) + 1}</span>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <span className="stat-icon">{stat.icon}</span>
            <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="dashboard-columns">
        {/* Recent Activity */}
        <div className="dashboard-card">
          <h3 className="card-title">📋 Recent Activity</h3>
          {recentActivities.length > 0 ? (
            <div className="activity-list">
              {recentActivities.slice(0, 5).map((activity, i) => (
                <div key={i} className="activity-item">
                  <span className="activity-icon">{activity.icon || '📖'}</span>
                  <div className="activity-details">
                    <span className="activity-text">{activity.text}</span>
                    <span className="activity-time">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {activity.xp && (
                    <span className="activity-xp">+{activity.xp} XP</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>📚</span>
              <p>No activity yet. Start learning to see your progress!</p>
              <Link to="/learn" className="btn-secondary">Start a Lesson</Link>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="dashboard-card">
          <h3 className="card-title">🏆 Achievements</h3>
          <div className="achievements-grid">
            {achievements.map((ach, i) => (
              <div 
                key={i} 
                className={`achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}`}
                title={ach.desc}
              >
                <span className="achievement-icon">{ach.icon}</span>
                <span className="achievement-name">{ach.name}</span>
                {!ach.unlocked && <span className="lock-icon">🔒</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions">
        <h3 className="card-title">⚡ Quick Actions</h3>
        <div className="actions-grid">
          <Link to="/learn" className="action-card">
            <span className="action-icon">📚</span>
            <span className="action-text">New Lesson</span>
          </Link>
          {/* Updated: Now navigates to profile settings */}
          <button className="action-card" onClick={goToProfileSettings}>
            <span className="action-icon">👤</span>
            <span className="action-text">Edit Profile</span>
          </button>
          <button className="action-card" onClick={() => {}}>
            <span className="action-icon">📊</span>
            <span className="action-text">View Progress</span>
          </button>
          <button className="action-card" onClick={() => {}}>
            <span className="action-icon">🎯</span>
            <span className="action-text">Set Goals</span>
          </button>
        </div>
      </div>

      {/* Education Info */}
      <div className="dashboard-education">
        <div className="education-info">
          <span className="edu-icon">🎓</span>
          <div className="edu-details">
            <span className="edu-level">{user.education || 'Not specified'}</span>
            {user.educationYear && (
              <span className="edu-year">{user.educationYear}</span>
            )}
            {user.educationTerm && (
              <span className="edu-term">
                {user.educationTerm === 'first' ? 'First Term' : 'Second Term'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}