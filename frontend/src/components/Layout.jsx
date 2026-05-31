import Sidebar from './SideBar';
import Header from './Header';

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-app)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Header />
        <main style={{
          flex: 1,
          padding: '28px 28px',
          overflowY: 'auto',
          animation: 'slideInLeft 0.2s ease',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
