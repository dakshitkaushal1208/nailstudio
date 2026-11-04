import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    authService
      .me()
      .then((u) => live && setUser(u))
      .catch(() => live && setUser(null))
      .finally(() => live && setReady(true));
    return () => {
      live = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const u = await authService.login(credentials);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const u = await authService.register(data);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    const u = await authService.updateProfile(data);
    setUser(u);
    return u;
  }, []);

  const value = useMemo(
    () => ({ user, ready, isAdmin: user?.role === 'ADMIN', login, register, logout, updateProfile }),
    [user, ready, login, register, logout, updateProfile]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
