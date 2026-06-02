import { useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../context/ThemeContext';
import '../styles/Shared.css';
import '../styles/utilities.css';

export default function Layout({ children }) {
  const { collapsed, toggleSidebar } = useTheme();

  const handleBackdropClick = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  return (
    <div className="layout-wrapper">
      {!collapsed && <div className="sidebar-backdrop" onClick={handleBackdropClick} />}
      <Sidebar />
      <div className="layout-content">
        <Header />
        <main className="layout-main">
          {children}
        </main>
      </div>
    </div>
  );
}
