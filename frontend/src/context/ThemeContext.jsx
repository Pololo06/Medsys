import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { THEME, SIDEBAR } from '../constants';

const ThemeContext = createContext(null);

function loadTheme() {
  try {
    const stored = localStorage.getItem(THEME.STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  } catch {
    return 'light';
  }
}

function loadCollapsed() {
  try { return localStorage.getItem(SIDEBAR.STORAGE_KEY) === 'true'; } catch { return false; }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(loadTheme);
  const [collapsed, setCollapsedState] = useState(loadCollapsed);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      try { localStorage.setItem(THEME.STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setCollapsedState(prev => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR.STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  const setCollapsed = useCallback(value => {
    setCollapsedState(value);
    try { localStorage.setItem(SIDEBAR.STORAGE_KEY, String(value)); } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, collapsed, toggleSidebar, setCollapsed }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
