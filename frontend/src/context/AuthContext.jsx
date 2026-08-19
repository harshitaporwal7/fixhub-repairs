import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { getErrorMessage } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('fixhub_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem('fixhub_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  async function login(email, password) {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('fixhub_token', data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  }

  async function register(payload) {
    try {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('fixhub_token', data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  }

  function logout() {
    localStorage.removeItem('fixhub_token');
    setUser(null);
  }

  async function updateProfile(payload) {
    try {
      const { data } = await api.put('/auth/me', payload);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile, isAdmin: user?.role === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
