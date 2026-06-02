import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Stethoscope, BookOpen,
  CalendarCheck, Building2, Clock, BarChart3,
  Activity, LogOut, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ROLE_LABEL, ROLE_COLOR, ROUTES } from '../constants';
import toast from 'react-hot-toast';
import '../styles/Sidebar.css';

const menuItems = [
  { path: ROUTES.DASHBOARD,   label: 'Dashboard',      icon: LayoutDashboard },
  { path: ROUTES.PATIENTS,    label: 'Pacientes',      icon: Users },
  { path: ROUTES.DOCTORS,     label: 'Doctores',       icon: Stethoscope },
  { path: ROUTES.CATALOG,     label: 'Catálogo',       icon: BookOpen },
  { path: ROUTES.APPOINTMENTS, label: 'Citas',          icon: CalendarCheck },
  { path: ROUTES.OFFICES,     label: 'Consultorios',   icon: Building2 },
  { path: ROUTES.AVAILABILITY, label: 'Disponibilidad', icon: Clock },
  { path: ROUTES.REPORTS,     label: 'Reportes',       icon: BarChart3 },
];

export default function Sidebar() {
  const { collapsed, toggleSidebar, setCollapsed } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();

  function handleLogout() {
    logout();
    toast.success('Sesión cerrada correctamente');
  }

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setCollapsed(true);
    }
  }, [location.pathname]);

  function isActive(path) {
    if (path === ROUTES.DASHBOARD) return location.pathname === ROUTES.DASHBOARD;
    return location.pathname.startsWith(path);
  }

  return (
    <nav
      className={`sidebar-container ${collapsed ? 'sidebar-compact' : ''}`}
      aria-label="Menú de navegación principal"
    >
      <div className={`sidebar-header ${collapsed ? 'sidebar-header--collapsed' : ''}`}>
        <div className="sidebar-logo-icon">
          <Activity size={17} color="white" strokeWidth={2.5} />
        </div>
        <div className="sidebar-logo-text">
          <p className="sidebar-brand">MedSys</p>
          <p className="sidebar-subtitle">Sistema Médico</p>
        </div>
      </div>

      <div className="sidebar-nav-list">
        {menuItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === ROUTES.DASHBOARD}
            title={collapsed ? label : undefined}
            className={`sidebar-link ${isActive(path) ? 'active' : ''}`}
          >
            <Icon size={18} className="sidebar-link-icon" />
            <span className="sidebar-link-text">{label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className={`sidebar-user-card ${collapsed ? 'sidebar-user-card--collapsed' : ''}`}>
          <div className="sidebar-user-avatar">
            {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.fullName || user?.email}</p>
            <span
              className="sidebar-user-role"
              style={{
                background: (ROLE_COLOR[user?.role] || '#64748b') + '25',
                color: ROLE_COLOR[user?.role] || '#94a3b8'
              }}
            >
              {ROLE_LABEL[user?.role] || user?.role}
            </span>
          </div>
        </div>

        <button
          className={`sidebar-logout-btn ${collapsed ? 'sidebar-logout-btn--collapsed' : ''}`}
          onClick={handleLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <LogOut size={17} className="sidebar-logout-icon" />
          <span className="sidebar-logout-text">Cerrar sesión</span>
        </button>
      </div>

      <button
        className="sidebar-collapse-btn"
        onClick={toggleSidebar}
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        <ChevronLeft size={16} className={`sidebar-chevron ${collapsed ? 'sidebar-chevron--rotated' : ''}`} />
      </button>
    </nav>
  );
}
