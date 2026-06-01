import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../context/ThemeContext';
import '../styles/Shared.css';

export default function Layout({ children }) {
    const { collapsed, toggleSidebar } = useTheme();

    useEffect(() => {
        function handleClick(e) {
            const clickedSidebar = e.target.closest('nav');
            const clickedHeader  = e.target.closest('header');
            const isMainItself   = e.target.tagName === 'MAIN';

            if (collapsed) {
                if (clickedSidebar || clickedHeader || isMainItself) toggleSidebar();
                return;
            }

            if (clickedHeader || isMainItself) toggleSidebar();
        }

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [collapsed, toggleSidebar]);

    return (
        <div className="layout-wrapper">
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