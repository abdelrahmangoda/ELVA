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
      xp: 0,
      level: 1,
      streak: 0,
      lessonsCompleted: 0,
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