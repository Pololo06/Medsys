import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TOAST_CONFIG, ROUTES } from './constants';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PacientesPage from './pages/PacientesPage';
import DoctoresPage from './pages/DoctoresPage';
import CatalogoPage from './pages/CatalogoPage';
import CitasPage from './pages/CitasPage';
import ConsultoriosPage from './pages/ConsultoriosPage';
import DisponibilidadPage from './pages/DisponibilidadPage';
import ReportesPage from './pages/ReportesPage';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster
              position={TOAST_CONFIG.position}
              toastOptions={{
                style: {
                  borderRadius: '10px',
                  background: '#0f172a',
                  color: '#f1f5f9',
                  fontSize: '0.875rem',
                  fontFamily: 'Instrument Sans, sans-serif',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                },
                success: {
                  iconTheme: { primary: '#22c55e', secondary: '#0f172a' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#0f172a' },
                },
                duration: TOAST_CONFIG.duration,
              }}
            />
            <Routes>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                        <Route path={ROUTES.PATIENTS} element={<PacientesPage />} />
                        <Route path={ROUTES.DOCTORS} element={<DoctoresPage />} />
                        <Route path={ROUTES.CATALOG} element={<CatalogoPage />} />
                        <Route path={ROUTES.APPOINTMENTS} element={<CitasPage />} />
                        <Route path={ROUTES.OFFICES} element={<ConsultoriosPage />} />
                        <Route path={ROUTES.AVAILABILITY} element={<DisponibilidadPage />} />
                        <Route path={ROUTES.REPORTS} element={<ReportesPage />} />
                        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
