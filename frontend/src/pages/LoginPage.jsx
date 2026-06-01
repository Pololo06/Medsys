import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '../services/AuthService';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/validation';
import '../styles/LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleBlur = (field) => {
    const newErrors = { ...errors };
    if (field === 'email' && email && !validateEmail(email)) {
      newErrors.email = true;
    } else {
      delete newErrors.email;
    }
    if (field === 'password' && password && !validatePassword(password)) {
      newErrors.password = true;
    } else {
      delete newErrors.password;
    }
    setErrors(newErrors);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor ingresa tu correo y contraseña.');
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ ...errors, email: true });
      toast.error('Por favor ingresa un correo válido.');
      return;
    }
    
    if (!validatePassword(password)) {
      setErrors({ ...errors, password: true });
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    
    setLoading(true);
    try {
      const data = await login(email, password);
      authLogin(data);
      toast.success(`¡Bienvenido, ${data.fullName || data.email}!`);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Credenciales incorrectas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-glow-1" />
      <div className="login-glow-2" />

      <div className="login-left-panel">
        <div className="login-logo">
          <div className="login-logo-box">
            <Activity size={18} color="white" strokeWidth={2.5} />
          </div>
          <span className="login-logo-text">MedSys</span>
        </div>

        <div className="login-headline">
          <h1 className="login-headline-main">Gestión médica</h1>
          <h1 className="login-headline-accent">inteligente.</h1>
          <p className="login-headline-desc">
            Administra pacientes, doctores y citas con una plataforma diseñada para la eficiencia clínica moderna.
          </p>
        </div>

        <div className="login-stats">
          {[
            { value: '24/7', label: 'SISTEMA ACTIVO', color: '#3b9df5' },
            { value: 'HIPAA', label: 'DATOS PROTEGIDOS', color: '#22c55e' },
            { value: '120+', label: 'USUARIOS ACTIVOS', color: '#8b5cf6' },
          ].map(({ value, label, color }) => (
            <div key={label} className="login-stat-card">
              <div className="login-stat-icon" style={{ background: color + '20' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              </div>
              <p className="login-stat-value">{value}</p>
              <p className="login-stat-label">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="login-right-panel">
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Iniciar sesión</h2>
            <p className="login-card-subtitle">Accede a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label className="login-form-label">Correo electrónico</label>
              <div className="login-form-input-wrapper">
                <Mail size={15} className="login-form-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="tu@correo.com"
                  autoComplete="username"
                  autoFocus
                  className={`login-form-input ${errors.email ? 'error' : ''}`}
                  style={errors.email ? { borderColor: '#ef4444' } : {}}
                />
              </div>
              {errors.email && <span className="login-form-error show">Ingresa un correo válido</span>}
            </div>

            <div className="login-form-group">
              <label className="login-form-label">Contraseña</label>
              <div className="login-form-input-wrapper">
                <Lock size={15} className="login-form-input-icon" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`login-form-input ${errors.password ? 'error' : ''}`}
                  style={errors.password ? { borderColor: '#ef4444' } : {}}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="login-password-toggle"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <span className="login-form-error show">Mínimo 6 caracteres</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Entrar al sistema
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer-note">
            <span className="login-footer-note-icon">🔒</span>
            <p className="login-footer-note-text">
              Acceso restringido al personal autorizado de la institución.
            </p>
          </div>

          <p className="login-copyright">Universidad del Magdalena · MedSys v1.0</p>
        </div>
      </div>
    </div>
  );
}
