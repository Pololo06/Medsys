import { useState, useEffect } from 'react';
import { Users, Stethoscope, CalendarCheck, Building2, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { getAllPatients } from '../services/PatientService';
import { getAllDoctors } from '../services/DoctorService';
import { getAppointments } from '../services/AppointmentService';
import { getOffices } from '../services/OfficeService';
import { useAuth } from '../context/AuthContext';
import { STATUS_MAP } from '../constants';
import CardSkeleton from '../components/Skeleton/CardSkeleton';
import TableSkeleton from '../components/Skeleton/TableSkeleton';
import '../styles/Dashboard.css';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: bg }}>
        <Icon size={19} color={color} strokeWidth={2} />
      </div>
      <div>
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value}</p>
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, iconBg, iconBorder, iconColor, value, label, sublabel }) {
  return (
    <div className="insight-card" style={{ background: iconBg, borderColor: iconBorder || 'transparent' }}>
      <div className="insight-icon" style={{ background: iconBg, borderColor: iconBorder || iconBg }}>
        <Icon size={18} color={iconColor} />
      </div>
      <div className="insight-text">
        <p className="insight-value">{value}</p>
        <p className="insight-label">{label}</p>
        {sublabel && <p className="insight-sublabel">{sublabel}</p>}
      </div>
    </div>
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
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1 className="page-title">
            Bienvenido, {(user?.fullName || 'Doctor').split(' ')[0]}
          </h1>
          <p className="page-subtitle">
            {fechaTexto} &middot; {hora}
          </p>
        </div>

        {!loading && todayAppts > 0 && (
          <div className="dashboard-today-badge">
            <Clock size={15} />
            <span>{todayAppts} cita{todayAppts !== 1 ? 's' : ''} hoy</span>
          </div>
        )}
      </div>

      <div className="dashboard-stats">
        {loading ? (
          <CardSkeleton count={4} />
        ) : (
          <>
            <StatCard icon={Users} label="Pacientes registrados" value={stats.patients} color="#14b8a6" bg="rgba(20,184,166,0.1)" />
            <StatCard icon={Stethoscope} label="Doctores activos" value={stats.doctors} color="#38bdf8" bg="rgba(56,189,248,0.1)" />
            <StatCard icon={CalendarCheck} label="Total de citas" value={stats.appointments} color="#a78bfa" bg="rgba(167,139,250,0.1)" />
            <StatCard icon={Building2} label="Consultorios" value={stats.offices} color="#f59e0b" bg="rgba(245,158,11,0.1)" />
          </>
        )}
      </div>

      {!loading && (
        <div className="dashboard-insights">
          <InsightCard
            icon={CheckCircle} iconColor="#10b981"
            iconBg="rgba(16,185,129,0.1)" iconBorder="rgba(16,185,129,0.2)"
            value={completedToday} label="Completadas" sublabel="Citas finalizadas"
          />
          <InsightCard
            icon={TrendingUp} iconColor="var(--accent)"
            iconBg="linear-gradient(135deg, rgba(20,184,166,0.06) 0%, rgba(56,189,248,0.04) 100%)"
            iconBorder="rgba(20,184,166,0.15)"
            value={stats.appointments > 0 ? 'Sistema en operación normal' : 'Sin citas registradas'}
            label={stats.appointments > 0 ? 'Operación normal' : 'Sin actividad'}
            sublabel="Todos los servicios disponibles"
          />
        </div>
      )}

      <div className="card dashboard-table-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Citas recientes</h3>
            <p className="card-subtitle">Últimas {recentAppts.length} registradas</p>
          </div>
        </div>
        <div className="table-container">
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
                <TableSkeleton rows={4} columns={5} />
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
                const st = STATUS_MAP[a.status] || { badge: 'badge-gray', label: a.status };
                return (
                  <tr key={a.id || i}>
                    <td className="td-primary">{a.patientName || '—'}</td>
                    <td className="td-secondary">{a.doctorName || '—'}</td>
                    <td className="td-muted">{a.appointmentTypeName || '—'}</td>
                    <td className="td-mono td-muted">
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
