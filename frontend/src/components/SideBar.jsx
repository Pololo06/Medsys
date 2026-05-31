import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Stethoscope, BookOpen,
  CalendarCheck, Building2, Clock, BarChart3,
  ChevronLeft, ChevronRight, Activity, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const SIDEBAR_FULL    = 240;
const SIDEBAR_COMPACT = 64;

const menuItems = [
  { path: '/',               label: 'Dashboard',     icon: LayoutDashboard },
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
  const { collapsed, toggleSidebar } = useTheme();
  const { user, logout } = useAuth();
  const w = collapsed ? SIDEBAR_COMPACT : SIDEBAR_FULL;

  function handleLogout() {
    logout();
    toast.success('Sesión cerrada correctamente');
  }

  return (
    <nav
      style={{
        width: w,
        minWidth: w,
        maxWidth: w,
        backgroundColor: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 300ms cubic-bezier(0.4,0,0.2,1), min-width 300ms cubic-bezier(0.4,0,0.2,1), max-width 300ms cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        flexShrink: 0,
        zIndex: 10,
        position: 'relative',
      }}
    >
      {/* ── Logo ───────────────────────────────────────── */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 10,
        minHeight: 64,
        flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: 'linear-gradient(135deg, #3b9df5, #1d7fe9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(59,157,245,0.4)',
        }}>
          <Activity size={17} color="white" strokeWidth={2.5} />
        </div>

        <div style={{
          overflow: 'hidden',
          opacity: collapsed ? 0 : 1,
          width: collapsed ? 0 : 'auto',
          transition: 'opacity 200ms ease, width 300ms ease',
          whiteSpace: 'nowrap',
        }}>
          <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1, letterSpacing: '-0.01em', margin: 0 }}>MedSys</p>
          <p style={{ color: '#475569', fontSize: '0.68rem', marginTop: 2, marginBottom: 0 }}>Sistema Médico</p>
        </div>
      </div>

      {/* ── Nav items ──────────────────────────────────── */}
      <div style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {menuItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            <span style={{
              opacity: collapsed ? 0 : 1,
              maxWidth: collapsed ? 0 : 160,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              transition: 'opacity 200ms ease, max-width 300ms ease',
            }}>
              {label}
            </span>
          </NavLink>
        ))}
      </div>

      {/* ── Footer: user + logout + toggle ─────────────── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 8px', flexShrink: 0 }}>

        {/* User info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: collapsed ? '6px 0' : '8px 6px',
          borderRadius: 10, marginBottom: 4,
          justifyContent: collapsed ? 'center' : 'flex-start',
          overflow: 'hidden',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #3b9df5, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '0.78rem',
          }}>
            {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div style={{
            overflow: 'hidden',
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 160,
            transition: 'opacity 200ms ease, max-width 300ms ease',
            whiteSpace: 'nowrap',
          }}>
            <p style={{ color: '#e2e8f0', fontSize: '0.78rem', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.fullName || user?.email}
            </p>
            <span style={{
              fontSize: '0.63rem', fontWeight: 700, padding: '1px 6px', borderRadius: 9999,
              background: (ROLE_COLOR[user?.role] || '#64748b') + '25',
              color: ROLE_COLOR[user?.role] || '#94a3b8',
            }}>
              {ROLE_LABEL[user?.role] || user?.role}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          style={{
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 10, color: '#94a3b8',
            fontSize: '0.875rem', fontWeight: 500, fontFamily: 'inherit',
            justifyContent: collapsed ? 'center' : 'flex-start',
            transition: 'background 150ms ease, color 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#e2e8f0'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
        >
          <LogOut size={17} style={{ flexShrink: 0 }} />
          <span style={{
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 160,
            overflow: 'hidden', whiteSpace: 'nowrap',
            transition: 'opacity 200ms ease, max-width 300ms ease',
          }}>
            Cerrar sesión
          </span>
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          style={{
            width: '100%', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '7px', borderRadius: 8, marginTop: 4,
            color: '#475569', background: 'rgba(255,255,255,0.04)',
            transition: 'background 150ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>
    </nav>
  );
}
