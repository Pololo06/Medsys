import { LogOut, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import '../styles/Header.css';

export default function Header() {
  const { logout } = useAuth();
  const { theme, toggleTheme, collapsed, toggleSidebar } = useTheme();

  function handleLogout() {
    logout();
    toast.success('Sesión cerrada correctamente');
  }

  return (
    <header className="header">
      <div className="header-content">
        <button
          onClick={toggleSidebar}
          className="header-menu-btn"
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <Menu size={20} />
        </button>
        <div className="header-actions">
          <button
            onClick={toggleTheme}
            className="header-theme-toggle"
            aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
