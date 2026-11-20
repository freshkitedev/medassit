import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_EXPIRED_EVENT, setCsrfToken } from '../services/api.js';
import { fetchCurrentUser, loginWithGoogle, logoutRequest } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check the server session on startup.
  useEffect(() => {
    let active = true;
    fetchCurrentUser()
      .then((u) => active && setUser(u))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Any API call that returns 401 mid-session ends up here.
  useEffect(() => {
    const onExpired = () => {
      setCsrfToken(null);
      setUser((current) => {
        if (current) setSessionExpired(true);
        return null;
      });
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (credential) => {
    const u = await loginWithGoogle(credential);
    setSessionExpired(false);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setSessionExpired(false);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), sessionExpired, login, logout }),
    [user, loading, sessionExpired, login, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
