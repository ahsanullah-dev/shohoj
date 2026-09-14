import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setSession, getStoredUser, clearSession } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => localStorage.getItem('shohoj_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          if (res.user) {
            setUser(res.user);
            setSession(token, res.user);
          }
        } catch (err) {
          if (err.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      setSession(res.token, res.user);
    }
    return res;
  };

  const register = async (name, email, password) => {
    return await api.post('/api/auth/register', { name, email, password });
  };

  const verifyEmail = async (email, code) => {
    const res = await api.post('/api/auth/verify-email', { email, code });
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      setSession(res.token, res.user);
    }
    return res;
  };

  const resendVerification = async (email) => {
    return await api.post('/api/auth/resend-verification', { email });
  };

  const loginWithGoogle = async (idToken) => {
    const res = await api.post('/api/auth/google', { idToken });
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      setSession(res.token, res.user);
    }
    return res;
  };

  const logout = () => {
    clearSession();
    setToken('');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    setSession(token, updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        verifyEmail,
        resendVerification,
        loginWithGoogle,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
