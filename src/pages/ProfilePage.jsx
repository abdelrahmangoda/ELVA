import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AvatarCreator, { buildAvatarSVG } from '../components/AvatarCreator';

export default function ProfilePage() {
  const { user, updateUser, updateAvatar, logout } = useAuth();
  const navigate = useNavigate();
  
  const [editing, setEditing] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateUser(formData);
    setEditing(false);
  };

  const handleAvatarSave = (avatarData) => {
    updateAvatar(avatarData);
    setShowAvatarEditor(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="avatar-section">
              <div 
                className="profile-avatar"
                onClick={() => setShowAvatarEditor(true)}
              >
                {user?.avatar ? (
                  <div dangerouslySetInnerHTML={{ __html: buildAvatarSVG(user.avatar, 150) }} />
                ) : (
                  <div className="avatar-placeholder-large">
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="avatar-edit-overlay">
                  ✏️ Edit
                </div>
              </div>
              
              <h2 className="profile-name">{user?.firstName} {user?.lastName}</h2>
              <p className="profile-email">{user?.email}</p>
              
              <div className="profile-badges">
                <span className="badge">Level {user?.level || 1}</span>
                <span className="badge">{user?.education || 'Student'}</span>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{user?.xp || 0}</span>
                <span className="stat-label">Total XP</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{user?.streak || 0}</span>
                <span className="stat-label">Day Streak</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{user?.lessonsCompleted || 0}</span>
                <span className="stat-label">Lessons</span>
              </div>
            </div>
          </div>

          <div className="profile-main">
            <div className="profile-card">
              <div className="card-header">
                <h3>Personal Information</h3>
                {!editing && (
                  <button className="btn-ghost" onClick={() => setEditing(true)}>
                    ✏️ Edit
                  </button>
                )}
              </div>
              
              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p>{user?.firstName}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p>{user?.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p>{user?.email}</p>
                  )}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Age</label>
                    <p>{user?.age} years</p>
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <p>{user?.gender === 'male' ? '👨 Male' : '👩 Female'}</p>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Education</label>
                  <p>{user?.education}</p>
                </div>
                
                {editing && (
                  <div className="form-buttons">
                    <button className="btn-secondary" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSave}>
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-card">
              <div className="card-header">
                <h3>Account Actions</h3>
              </div>
              
              <div className="account-actions">
                <button className="btn-secondary" onClick={() => setShowAvatarEditor(true)}>
                  🎨 Change Avatar
                </button>
                <button className="btn-danger" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAvatarEditor && (
        <AvatarCreator
          initialAvatar={user?.avatar}
          onSave={handleAvatarSave}
          onClose={() => setShowAvatarEditor(false)}
          isModal={true}
          showFaceScan={true}
        />
      )}
    </div>
  );
}