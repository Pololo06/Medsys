import { LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import '../styles/Header.css';

export default function Header() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  function handleLogout() {
    logout();
    toast.success('Sesión cerrada correctamente');
  }

  return (
    <header className="header">
      <div className="header-content">
        <div />
        <div className="header-actions">
          <button
            onClick={toggleTheme}
            title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
            className="header-theme-toggle"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            onClick={handleLogout}
            className="header-logout-btn"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
