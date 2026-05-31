import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const THEME_KEY    = 'medsys_theme';
const SIDEBAR_KEY  = 'medsys_sidebar_collapsed';

function loadTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'light'; } catch { return 'light'; }
}

function loadCollapsed() {
  try { return localStorage.getItem(SIDEBAR_KEY) === 'true'; } catch { return false; }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState]       = useState(loadTheme);
  const [collapsed, setCollapsedState] = useState(loadCollapsed);

  // Apply dark class to <html> on mount and on change
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
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setCollapsedState(prev => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, collapsed, toggleSidebar }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
