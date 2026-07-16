import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from './authApi.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await authApi.me();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password, rememberMe = false) => {
    const data = await authApi.login({ email, password, rememberMe });
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (name, email, password, confirmPassword) => {
    const data = await authApi.signup({ name, email, password, confirmPassword });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, refresh, isAdmin: user?.role === 'admin' }),
    [user, loading, login, signup, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
