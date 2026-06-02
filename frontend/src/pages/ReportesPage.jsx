import { useState } from 'react';
import { Play, Building2, Stethoscope, UserX, BarChart3, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getOfficeOccupancy, getDoctorProductivity, getNoShowPatients } from '../services/ReportService';

const today     = new Date().toISOString().split('T')[0];
const monthAgo  = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

function ReportCard({ icon: Icon, iconColor, iconBg, title, description, children, onRun, loading }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={18} color={iconColor} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>{title}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>{description}</p>
          </div>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={onRun}
          disabled={loading}
          style={{ flexShrink: 0 }}
        >
          {loading
            ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Generando...</>
            : <><Play size={13} /> Generar</>
          }
        </button>
      </div>
      <div style={{ padding: '16px 20px' }}>
        {children}
      </div>
    </div>
  );
}

function DateRange({ state, setState }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      <div>
        <label className="input-label">Desde</label>
        <input type="date" value={state.from} onChange={e => setState(s => ({ ...s, from: e.target.value }))} className="input" style={{ width: 160 }} />
      </div>
      <div>
        <label className="input-label">Hasta</label>
        <input type="date" value={state.to} onChange={e => setState(s => ({ ...s, to: e.target.value }))} className="input" style={{ width: 160 }} />
      </div>
    </div>
  );
}

function DataTable({ rows, columns }) {
  if (!rows || rows.length === 0) return (
    <div className="empty-state" style={{ padding: '30px 20px' }}>
      <div className="empty-state-icon"><BarChart3 size={20} /></div>
      <p className="empty-state-text">Sin datos en el período seleccionado.</p>
    </div>
  );
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="medsys-table" style={{ fontSize: '0.82rem' }}>
        <thead>
          <tr>
            {columns.map(c => <th key={c.key}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map(c => (
                <td key={c.key} style={c.bold ? { fontWeight: 700, color: 'var(--text-primary)' } : {}}>
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReportesPage() {
  const [ocup,    setOcup]    = useState({ from: monthAgo, to: today, data: null, loading: false, error: '' });
  const [prod,    setProd]    = useState({ data: null, loading: false, error: '' });
  const [noshow,  setNoshow]  = useState({ from: monthAgo, to: today, data: null, loading: false, error: '' });

  async function runOcupancy() {
    setOcup(s => ({ ...s, loading: true, error: '' }));
    try {
      const d = await getOfficeOccupancy(ocup.from, ocup.to);
      setOcup(s => ({ ...s, data: Array.isArray(d) ? d : [], loading: false }));
    } catch (e) {
      setOcup(s => ({ ...s, loading: false, error: e.message || 'Error al generar.' }));
      toast.error('Error al generar reporte de ocupación.');
    }
  }

  async function runProductivity() {
    setProd(s => ({ ...s, loading: true, error: '' }));
    try {
      const d = await getDoctorProductivity();
      setProd({ data: Array.isArray(d) ? d : [], loading: false, error: '' });
    } catch (e) {
      setProd({ data: null, loading: false, error: e.message || 'Error al generar.' });
      toast.error('Error al generar reporte de productividad.');
    }
  }

  async function runNoshow() {
    setNoshow(s => ({ ...s, loading: true, error: '' }));
    try {
      const d = await getNoShowPatients(noshow.from, noshow.to);
      setNoshow(s => ({ ...s, data: Array.isArray(d) ? d : [], loading: false }));
    } catch (e) {
      setNoshow(s => ({ ...s, loading: false, error: e.message || 'Error al generar.' }));
      toast.error('Error al generar reporte de no-shows.');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 className="page-title">Reportes</h1>
        <p className="page-subtitle">Análisis y estadísticas del sistema médico</p>
      </div>

      {/* Ocupación de consultorios — OfficeOccupancyResponse: officeId, officeName, appointmentCount */}
      <ReportCard
        icon={Building2} iconColor="#1d7fe9" iconBg="#dbeffe"
        title="Ocupación de Consultorios"
        description="Número de citas por consultorio en el período."
        onRun={runOcupancy}
        loading={ocup.loading}
      >
        <DateRange state={ocup} setState={setOcup} />
        {ocup.error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{ocup.error}</div>}
        {ocup.data !== null && (
          <DataTable
            rows={ocup.data}
            columns={[
              { key: 'officeName', label: 'Consultorio', bold: true },
              { key: 'appointmentCount', label: 'Citas', render: v => (
                <span className="badge badge-blue">{v}</span>
              )},
            ]}
          />
        )}
      </ReportCard>

      {/* Productividad de doctores — DoctorProductivityResponse: doctorId, doctorName, completedAppointments */}
      <ReportCard
        icon={Stethoscope} iconColor="#15803d" iconBg="#dcfce7"
        title="Productividad de Doctores"
        description="Citas completadas por doctor (todos los períodos)."
        onRun={runProductivity}
        loading={prod.loading}
      >
        {prod.error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{prod.error}</div>}
        {prod.data !== null && (
          <DataTable
            rows={prod.data}
            columns={[
              { key: 'doctorName', label: 'Doctor', bold: true },
              { key: 'completedAppointments', label: 'Citas completadas', render: v => (
                <span className="badge badge-green">{v}</span>
              )},
            ]}
          />
        )}
      </ReportCard>

      {/* No-show patients — NoShowPatientResponse: patientId, patientName, noShowCount */}
      <ReportCard
        icon={UserX} iconColor="#c2410c" iconBg="#ffedd5"
        title="Pacientes con Inasistencias"
        description="Pacientes que no asistieron a sus citas en el período."
        onRun={runNoshow}
        loading={noshow.loading}
      >
        <DateRange state={noshow} setState={setNoshow} />
        {noshow.error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{noshow.error}</div>}
        {noshow.data !== null && (
          <DataTable
            rows={noshow.data}
            columns={[
              { key: 'patientName', label: 'Paciente', bold: true },
              { key: 'noShowCount', label: 'Inasistencias', render: v => (
                <span className="badge badge-orange">{v}</span>
              )},
            ]}
          />
        )}
      </ReportCard>
    </div>
  );
}
