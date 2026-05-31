import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '../services/AuthService';
import { useAuth } from '../context/AuthContext';

const stats = [
  { icon: Activity, value: '24/7', label: 'SISTEMA ACTIVO' },
  { icon: Shield,   value: 'HIPAA', label: 'DATOS PROTEGIDOS' },
  { icon: Activity, value: '120+', label: 'USUARIOS ACTIVOS' },
];

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login: authLogin }    = useAuth();
  const navigate                = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor ingresa tu correo y contraseña.');
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b35 50%, #0a0f1e 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* Background glow effects */}
      <div style={{ position: 'absolute', top: '15%', left: '30%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,157,245,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 48px',
        position: 'relative',
        zIndex: 1,
        minWidth: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 56 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b9df5, #1d7fe9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,157,245,0.4)',
          }}>
            <Activity size={18} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>MedSys</span>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 52 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 8px' }}>
            Gestión médica
          </h1>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#3b9df5', lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 20px' }}>
            inteligente.
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.6, maxWidth: 380, margin: 0 }}>
            Administra pacientes, doctores y citas con una plataforma diseñada para la eficiencia clínica moderna.
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 440 }}>
          {[
            { value: '24/7', label: 'SISTEMA ACTIVO', color: '#3b9df5' },
            { value: 'HIPAA', label: 'DATOS PROTEGIDOS', color: '#22c55e' },
            { value: '120+', label: 'USUARIOS ACTIVOS', color: '#8b5cf6' },
          ].map(({ value, label, color }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              padding: '18px 16px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              </div>
              <p style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1rem', margin: '0 0 2px', letterSpacing: '-0.01em' }}>{value}</p>
              <p style={{ color: '#475569', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL (form) ── */}
      <div style={{
        width: 420,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          width: '100%',
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 20,
          padding: '36px 32px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
              Iniciar sesión
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Accede a tu cuenta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Correo electrónico
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, color: '#94a3b8', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  autoComplete="username"
                  autoFocus
                  style={{
                    width: '100%', padding: '10px 12px 10px 36px',
                    border: '1.5px solid #e2e8f0', borderRadius: 10,
                    fontSize: '0.875rem', color: '#0f172a', background: '#f8fafc',
                    outline: 'none', fontFamily: 'inherit',
                    transition: 'border-color 150ms ease, box-shadow 150ms ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#3b9df5'; e.target.style.boxShadow = '0 0 0 3px rgba(59,157,245,0.12)'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Contraseña
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, color: '#94a3b8', pointerEvents: 'none' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '10px 40px 10px 36px',
                    border: '1.5px solid #e2e8f0', borderRadius: 10,
                    fontSize: '0.875rem', color: '#0f172a', background: '#f8fafc',
                    outline: 'none', fontFamily: 'inherit',
                    transition: 'border-color 150ms ease, box-shadow 150ms ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#3b9df5'; e.target.style.boxShadow = '0 0 0 3px rgba(59,157,245,0.12)'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  style={{
                    position: 'absolute', right: 11, background: 'none', border: 'none',
                    cursor: 'pointer', color: '#94a3b8', padding: 2,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', marginTop: 6,
                padding: '11px 20px',
                background: loading ? '#93c5fd' : 'linear-gradient(135deg, #3b9df5, #1d7fe9)',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: '0.9rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'inherit',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(29,127,233,0.35)',
                transition: 'all 150ms ease',
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
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

          {/* Footer note */}
          <div style={{
            marginTop: 20,
            padding: '12px 14px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 10,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <span style={{ fontSize: '0.78rem' }}>🔒</span>
            <p style={{ fontSize: '0.78rem', color: '#92400e', margin: 0, lineHeight: 1.4 }}>
              Acceso restringido al personal autorizado de la institución.
            </p>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', marginTop: 20, marginBottom: 0 }}>
            Universidad del Magdalena · MedSys v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
