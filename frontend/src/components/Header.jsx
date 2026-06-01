import { useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import '../styles/Header.css'; 

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
        <header className="header-container">
            <h1 className="header-title">{title}</h1>

            <button
                className="theme-toggle-btn"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
        </header>
    );
}