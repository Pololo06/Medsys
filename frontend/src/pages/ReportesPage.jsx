import { useState } from 'react';
import { Play, Building2, Stethoscope, UserX, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getOfficeOccupancy, getDoctorProductivity, getNoShowPatients } from '../services/ReportService';

const today    = new Date().toISOString().split('T')[0];
const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

function ReportCard({ icon: Icon, iconColor, iconBg, title, description, children, onRun, loading }) {
  return (
    <div className="card report-card">
      <div className="report-card-header">
        <div className="report-card-left">
          <div className="report-card-icon" style={{ background: iconBg }}>
            <Icon size={18} color={iconColor} />
          </div>
          <div>
            <p className="report-card-title">{title}</p>
            <p className="report-card-desc">{description}</p>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onRun} disabled={loading}>
          {loading ? 'Generando...' : <><Play size={13} /> Generar</>}
        </button>
      </div>
      <div className="report-card-body">
        {children}
      </div>
    </div>
  );
}

function DateRange({ state, setState }) {
  return (
    <div className="date-range">
      <div className="date-range-field">
        <label className="input-label" htmlFor="dr-from">Desde</label>
        <input id="dr-from" type="date" value={state.from} onChange={e => setState(s => ({ ...s, from: e.target.value }))} className="input date-input" />
      </div>
      <div className="date-range-field">
        <label className="input-label" htmlFor="dr-to">Hasta</label>
        <input id="dr-to" type="date" value={state.to} onChange={e => setState(s => ({ ...s, to: e.target.value }))} className="input date-input" />
      </div>
    </div>
  );
}

function DataTable({ rows, columns }) {
  if (!rows || rows.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-icon"><BarChart3 size={20} /></div>
      <p className="empty-state-text">Sin datos en el período seleccionado.</p>
    </div>
  );
  return (
    <div className="table-container">
      <table className="medsys-table">
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map(c => (
                <td key={c.key} className={c.bold ? 'td-primary' : ''}>
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
  const [ocup,   setOcup]   = useState({ from: monthAgo, to: today, data: null, loading: false, error: '' });
  const [prod,   setProd]   = useState({ data: null, loading: false, error: '' });
  const [noshow, setNoshow] = useState({ from: monthAgo, to: today, data: null, loading: false, error: '' });

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
    <div className="reports-page">
      <div className="reports-header">
        <h1 className="page-title">Reportes</h1>
        <p className="page-subtitle">Análisis y estadísticas del sistema médico</p>
      </div>

      <ReportCard
        icon={Building2} iconColor="#1d7fe9" iconBg="#dbeffe"
        title="Ocupación de Consultorios"
        description="Número de citas por consultorio en el período."
        onRun={runOcupancy} loading={ocup.loading}
      >
        <DateRange state={ocup} setState={setOcup} />
        {ocup.error && <div className="alert alert-error">{ocup.error}</div>}
        {ocup.data !== null && (
          <DataTable
            rows={ocup.data}
            columns={[
              { key: 'officeName', label: 'Consultorio', bold: true },
              { key: 'appointmentCount', label: 'Citas', render: v => <span className="badge badge-blue">{v}</span> },
            ]}
          />
        )}
      </ReportCard>

      <ReportCard
        icon={Stethoscope} iconColor="#15803d" iconBg="#dcfce7"
        title="Productividad de Doctores"
        description="Citas completadas por doctor (todos los períodos)."
        onRun={runProductivity} loading={prod.loading}
      >
        {prod.error && <div className="alert alert-error">{prod.error}</div>}
        {prod.data !== null && (
          <DataTable
            rows={prod.data}
            columns={[
              { key: 'doctorName', label: 'Doctor', bold: true },
              { key: 'completedAppointments', label: 'Citas completadas', render: v => <span className="badge badge-green">{v}</span> },
            ]}
          />
        )}
      </ReportCard>

      <ReportCard
        icon={UserX} iconColor="#c2410c" iconBg="#ffedd5"
        title="Pacientes con Inasistencias"
        description="Pacientes que no asistieron a sus citas en el período."
        onRun={runNoshow} loading={noshow.loading}
      >
        <DateRange state={noshow} setState={setNoshow} />
        {noshow.error && <div className="alert alert-error">{noshow.error}</div>}
        {noshow.data !== null && (
          <DataTable
            rows={noshow.data}
            columns={[
              { key: 'patientName', label: 'Paciente', bold: true },
              { key: 'noShowCount', label: 'Inasistencias', render: v => <span className="badge badge-orange">{v}</span> },
            ]}
          />
        )}
      </ReportCard>
    </div>
  );
}
