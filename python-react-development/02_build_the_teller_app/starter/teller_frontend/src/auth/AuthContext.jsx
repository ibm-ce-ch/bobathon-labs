import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getAuthToken,
} from '../services/api';

// Reactive auth state on top of the api token store (which persists in
// sessionStorage). Pre-wired so protected routes survive refresh and the UI
// re-renders on login/logout. Use the useAuth() hook in your pages.
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getAuthToken());

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    setToken(getAuthToken());
    return data;
  };

  const logout = () => {
    apiLogout();
    setToken(null);
  };

  // The api layer fires 'session-expired' on a 401 — reflect that here.
  useEffect(() => {
    const onExpired = () => setToken(null);
    window.addEventListener('session-expired', onExpired);
    return () => window.removeEventListener('session-expired', onExpired);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
