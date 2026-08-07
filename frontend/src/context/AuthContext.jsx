import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    const stored = localStorage.getItem('userInfo');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const persist = (user, accessToken) => {
    localStorage.setItem('userInfo', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    setUserInfo(user);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      persist(data.user, data.accessToken);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      persist(data.user, data.accessToken);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem('userInfo');
    localStorage.removeItem('accessToken');
    setUserInfo(null);
  };

  const refreshProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      const updated = { ...userInfo, ...data.user };
      localStorage.setItem('userInfo', JSON.stringify(updated));
      setUserInfo(updated);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // keep localStorage in sync if userInfo changes elsewhere
  }, [userInfo]);

  return (
    <AuthContext.Provider value={{ userInfo, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
