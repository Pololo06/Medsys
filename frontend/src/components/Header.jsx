import { useLocation } from 'react-router-dom';
import { LogOut, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ROUTES } from '../constants';
import toast from 'react-hot-toast';
import '../styles/Header.css';

const PAGE_TITLES = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.DOCTORS]: 'Doctores',
  [ROUTES.PATIENTS]: 'Pacientes',
  [ROUTES.CATALOG]: 'Catálogo',
  [ROUTES.APPOINTMENTS]: 'Citas',
  [ROUTES.OFFICES]: 'Consultorios',
  [ROUTES.AVAILABILITY]: 'Disponibilidad',
  [ROUTES.REPORTS]: 'Reportes'
};

export default function Header() {
  const { logout } = useAuth();
  const { theme, toggleTheme, collapsed, toggleSidebar } = useTheme();
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] || '';

  function handleLogout() {
    logout();
    toast.success('Sesión cerrada correctamente');
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button
            onClick={toggleSidebar}
            className="header-menu-btn"
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <Menu size={20} />
          </button>
          {pageTitle && <span className="header-page-title">{pageTitle}</span>}
        </div>
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
