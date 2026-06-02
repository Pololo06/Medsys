import { useState, useEffect } from 'react';
import { Users, Stethoscope, CalendarCheck, Building2, TrendingUp, ArrowUpRight, Clock, CheckCircle } from 'lucide-react';
import { getAllPatients } from '../services/PatientService';
import { getAllDoctors } from '../services/DoctorService';
import { getAppointments } from '../services/AppointmentService';
import { getOffices } from '../services/OfficeService';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  SCHEDULED: { badge: 'badge-blue',   label: 'Programada' },
  CONFIRMED:  { badge: 'badge-teal',   label: 'Confirmada'  },
  COMPLETED:  { badge: 'badge-violet', label: 'Completada'  },
  CANCELLED:  { badge: 'badge-red',    label: 'Cancelada'   },
  NO_SHOW:    { badge: 'badge-amber',  label: 'No asistió'  },
};

function StatCard({ icon: Icon, label, value, color, bg, loading, delta }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="stat-card-icon" style={{ background: bg }}>
          <Icon size={19} color={color} strokeWidth={2} />
        </div>
        {!loading && delta !== undefined && (
          <div className="stat-card-trend">
            <ArrowUpRight size={12} />
            <span>{delta}</span>
          </div>
        )}
      </div>
      <div>
        <p className="stat-card-label">{label}</p>
        {loading ? (
          <div className="skeleton" style={{ height: 38, width: 64, borderRadius: 8, marginTop: 4 }} />
        ) : (
          <p className="stat-card-value">{value}</p>
        )}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[160, 140, 100, 80, 70].map((w, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <div className="skeleton" style={{ height: 13, width: w, borderRadius: 4 }} />
        </td>
      ))}
    </tr>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0, offices: 0 });
  const [loading, setLoading] = useState(true);
  const [recentAppts, setRecentAppts] = useState([]);
  const { user } = useAuth();

  const now = new Date();
  const fechaTexto = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const hora = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    async function load() {
      const [pR, dR, aR, oR] = await Promise.allSettled([getAllPatients(), getAllDoctors(), getAppointments(), getOffices()]);
      const patients = pR.status === 'fulfilled' ? (pR.value || []) : [];
      const doctors  = dR.status === 'fulfilled' ? (dR.value || []) : [];
      const appts    = aR.status === 'fulfilled' ? (aR.value || []) : [];
      const offices  = oR.status === 'fulfilled' ? (oR.value || []) : [];
      setRecentAppts(appts.slice(0, 8));
      setStats({ patients: patients.length, doctors: doctors.length, appointments: appts.length, offices: offices.length });
      setLoading(false);
    }
    load();
  }, []);

  const todayAppts = recentAppts.filter(a => {
    if (!a.startTime) return false;
    return new Date(a.startTime).toDateString() === now.toDateString();
  }).length;

  const completedToday = recentAppts.filter(a => a.status === 'COMPLETED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Welcome header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">
            Bienvenido, {(user?.fullName || 'Doctor').split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle" style={{ textTransform: 'capitalize', marginTop: 4 }}>
            {fechaTexto} · {hora}
          </p>
        </div>

        {!loading && todayAppts > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)',
            borderRadius: 12, padding: '10px 16px',
          }}>
            <Clock size={15} color="var(--accent)" />
            <p style={{ fontSize: '0.84rem', color: 'var(--teal-600)', fontWeight: 700, margin: 0 }}>
              {todayAppts} cita{todayAppts !== 1 ? 's' : ''} hoy
            </p>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <StatCard
          icon={Users} label="Pacientes registrados" value={stats.patients}
          color="#14b8a6" bg="rgba(20,184,166,0.1)" loading={loading}
        />
        <StatCard
          icon={Stethoscope} label="Doctores activos" value={stats.doctors}
          color="#38bdf8" bg="rgba(56,189,248,0.1)" loading={loading}
        />
        <StatCard
          icon={CalendarCheck} label="Total de citas" value={stats.appointments}
          color="#a78bfa" bg="rgba(167,139,250,0.1)" loading={loading}
        />
        <StatCard
          icon={Building2} label="Consultorios" value={stats.offices}
          color="#f59e0b" bg="rgba(245,158,11,0.1)" loading={loading}
        />
      </div>

      {/* Quick insights row */}
      {!loading && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            flex: '1 1 200px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle size={18} color="#10b981" />
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: 0 }}>
                {completedToday}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Completadas
              </p>
            </div>
          </div>

          <div style={{
            flex: '1 1 200px',
            background: 'linear-gradient(135deg, rgba(20,184,166,0.06) 0%, rgba(56,189,248,0.04) 100%)',
            border: '1px solid rgba(20,184,166,0.15)',
            borderRadius: 'var(--radius-xl)', padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: 'rgba(20,184,166,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={18} color="var(--accent)" />
            </div>
            <div>
              <p style={{ fontSize: '0.84rem', color: 'var(--teal-600)', fontWeight: 700, margin: 0 }}>
                {stats.appointments > 0 ? 'Sistema en operación normal' : 'Sin citas registradas'}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500, marginTop: 2 }}>
                Todos los servicios disponibles
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent appointments */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Citas recientes</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>
              Últimas {recentAppts.length} registradas
            </p>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="medsys-table">
            <thead>
              <tr>
                {['Paciente', 'Doctor', 'Tipo de atención', 'Fecha', 'Estado'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4].map(i => <SkeletonRow key={i} />)
              ) : recentAppts.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><CalendarCheck size={22} /></div>
                      <p className="empty-state-text">No hay citas registradas.</p>
                    </div>
                  </td>
                </tr>
              ) : recentAppts.map((a, i) => {
                const fecha = a.startTime ? new Date(a.startTime) : null;
                const st = STATUS_CONFIG[a.status] || { badge: 'badge-gray', label: a.status };
                return (
                  <tr key={a.id || i}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{a.patientName || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{a.doctorName || '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{a.appointmentTypeName || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {fecha ? fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) + '  ' + fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td>
                      <span className={`badge ${st.badge}`}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
