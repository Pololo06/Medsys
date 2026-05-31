import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const USER_KEY = 'medsys_user';

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const login = useCallback((userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const isAuthenticated = !!user;
  const hasRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
