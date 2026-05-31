import { useEffect } from 'react';
import Sidebar from './SideBar';
import Header from './Header';
import { useTheme } from '../context/ThemeContext';

export default function Layout({ children }) {
  const { collapsed, toggleSidebar } = useTheme();

  useEffect(() => {
    function handleClick(e) {
      if (collapsed) return;

      const clickedSidebar = e.target.closest('nav');
      const clickedHeader = e.target.closest('header');

      if (!clickedSidebar && !clickedHeader) {
        toggleSidebar();
      }
    }

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [collapsed, toggleSidebar]);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--bg-app)',
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <Header />

        <main
          style={{
            flex: 1,
            padding: '28px 28px',
            overflowY: 'auto',
            animation: 'slideInLeft 0.2s ease',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}