import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Stethoscope, BookOpen,
  CalendarCheck, Building2, Clock, BarChart3,
  Activity, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import '../styles/Sidebar.css';

const SIDEBAR_FULL    = 240;
const SIDEBAR_COMPACT = 64;

const menuItems = [
  { path: '/',               label: 'Dashboard',      icon: LayoutDashboard },
  { path: '/pacientes',      label: 'Pacientes',      icon: Users },
  { path: '/doctores',       label: 'Doctores',       icon: Stethoscope },
  { path: '/catalogo',       label: 'Catálogo',       icon: BookOpen },
  { path: '/citas',          label: 'Citas',          icon: CalendarCheck },
  { path: '/consultorios',   label: 'Consultorios',   icon: Building2 },
  { path: '/disponibilidad', label: 'Disponibilidad', icon: Clock },
  { path: '/reportes',       label: 'Reportes',       icon: BarChart3 },
];

const ROLE_LABEL = { ADMIN: 'Administrador', DOCTOR: 'Doctor', RECEPTIONIST: 'Recepcionista' };
const ROLE_COLOR = { ADMIN: '#f97316', DOCTOR: '#3b9df5', RECEPTIONIST: '#22c55e' };

export default function Sidebar() {
  const { collapsed} = useTheme();
  const { user, logout } = useAuth();

  // Categoría B: Dinámico
  const w = collapsed ? SIDEBAR_COMPACT : SIDEBAR_FULL;

  function handleLogout() {
    logout();
    toast.success('Sesión cerrada correctamente');
  }

  return (
      <nav className="sidebar-container" style={{ width: w, minWidth: w, maxWidth: w }}>

        {/* HEADER LOGO */}
        <div className={`sidebar-header ${collapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-logo-icon">
            <Activity size={17} color="white" strokeWidth={2.5} />
          </div>

          {/* Categoría B: Dinámico (Depende del estado collapsed) */}
          <div className="sidebar-logo-text" style={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}>
            <p className="sidebar-brand">MedSys</p>
            <p className="sidebar-subtitle">Sistema Médico</p>
          </div>
        </div>

        {/* NAV ITEMS */}
        <div className="sidebar-nav-list">
          {menuItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
              >
                <Icon size={18} className="sidebar-link-icon" />
                <span className="sidebar-link-text" style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 160 }}>
              {label}
            </span>
              </NavLink>
          ))}
        </div>

        {/* FOOTER */}
        <div className="sidebar-footer">
          <div className={`sidebar-user-card ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-user-avatar">
              {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
            </div>

            <div className="sidebar-user-info" style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 160 }}>
              <p className="sidebar-user-name">
                {user?.fullName || user?.email}
              </p>
              {/* Categoría B: Color dinámico por rol */}
              <span className="sidebar-user-role" style={{
                background: (ROLE_COLOR[user?.role] || '#64748b') + '25',
                color: ROLE_COLOR[user?.role] || '#94a3b8'
              }}>
              {ROLE_LABEL[user?.role] || user?.role}
            </span>
            </div>
          </div>

          <button className={`sidebar-logout-btn ${collapsed ? 'collapsed' : ''}`} onClick={handleLogout} title="Cerrar sesión">
            <LogOut size={17} className="sidebar-logout-icon" />
            <span className="sidebar-logout-text" style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 160 }}>
            Cerrar sesión
          </span>
          </button>
        </div>
      </nav>
  );
}