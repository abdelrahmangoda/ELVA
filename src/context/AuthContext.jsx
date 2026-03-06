// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('elva_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }
    setLoading(false);
  }, []);

  const signup = (userData) => {
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      // Initial scores start at 0
      xp: 0,
      level: 1,
      streak: 0,
      lessonsCompleted: 0,
      quizzesCompleted: 0,
      totalStudyTime: 0,
      achievements: [],
      recentActivity: [],
      subjectsProgress: {},
    };
    setUser(newUser);
    localStorage.setItem('elva_user', JSON.stringify(newUser));
    return newUser;
  };

  const login = (email, password) => {
    const savedUser = localStorage.getItem('elva_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.email === email) {
        setUser(userData);
        return { success: true, user: userData };
      }
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elva_user');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('elva_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const updateAvatar = (avatarData) => {
    return updateUser({ avatar: avatarData });
  };

  const addXP = (amount) => {
    const newXP = (user?.xp || 0) + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    return updateUser({ xp: newXP, level: newLevel });
  };

  const addActivity = (activity) => {
    const activities = user?.recentActivity || [];
    const newActivities = [
      { ...activity, timestamp: Date.now() },
      ...activities.slice(0, 19) // Keep last 20
    ];
    return updateUser({ recentActivity: newActivities });
  };

  const incrementLessons = () => {
    return updateUser({ lessonsCompleted: (user?.lessonsCompleted || 0) + 1 });
  };

  const incrementQuizzes = () => {
    return updateUser({ quizzesCompleted: (user?.quizzesCompleted || 0) + 1 });
  };

  const updateStreak = () => {
    const lastActive = user?.lastActiveDate;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    let newStreak = user?.streak || 0;
    
    if (lastActive === today) {
      // Already active today, no change
    } else if (lastActive === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1; // Reset streak
    }
    
    return updateUser({ streak: newStreak, lastActiveDate: today });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading ELVA...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      signup,
      login,
      logout,
      updateUser,
      updateAvatar,
      addXP,
      addActivity,
      incrementLessons,
      incrementQuizzes,
      updateStreak,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}