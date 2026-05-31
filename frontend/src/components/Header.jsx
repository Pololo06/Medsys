import { useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const pageTitles = {
  '/':               'Dashboard',
  '/pacientes':      'Gestión de Pacientes',
  '/doctores':       'Control de Doctores',
  '/catalogo':       'Catálogo de Servicios',
  '/citas':          'Programación de Citas',
  '/consultorios':   'Administración de Consultorios',
  '/disponibilidad': 'Disponibilidad de Doctores',
  '/reportes':       'Generación de Reportes',
};

export default function Header() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'MedSys';
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={{
      height: 64,
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
      gap: 16,
    }}>
      <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.01em', margin: 0 }}>
        {title}
      </h1>

      {/* Dark mode toggle */}
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        style={{
          width: 36, height: 36, borderRadius: '50%', border: 'none',
          background: 'var(--gray-100)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--gray-500)',
          transition: 'background var(--transition), color var(--transition)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-150)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--gray-100)'}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  );
}
