import { useState, useEffect } from 'react';
import { Plus, CalendarCheck, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAppointments, createAppointment, confirmAppointment, cancelAppointment, completeAppointment, setAsNoShowAppointment } from '../services/AppointmentService';
import { getAllPatients } from '../services/PatientService';
import { getAllDoctors } from '../services/DoctorService';
import { getOffices } from '../services/OfficeService';
import { getAppointmentTypes } from '../services/AppointmentTypeService';
import ConfirmDialog from '../components/ConfirmDialog';

const STATUS_MAP = {
  SCHEDULED: { badge: 'badge-blue',   label: 'Programada' },
  CONFIRMED:  { badge: 'badge-teal',   label: 'Confirmada'  },
  COMPLETED:  { badge: 'badge-violet', label: 'Completada'  },
  CANCELLED:  { badge: 'badge-red',    label: 'Cancelada'   },
  NO_SHOW:    { badge: 'badge-amber',  label: 'No asistió'  },
};

export default function CitasPage() {
  const [citas, setCitas]           = useState([]);
  const [patients, setPatients]     = useState([]);
  const [doctors, setDoctors]       = useState([]);
  const [offices, setOffices]       = useState([]);
  const [types, setTypes]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModal, setIsCancelModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [form, setForm]             = useState({ patientId: '', doctorId: '', officeId: '', appointmentTypeId: '', startTime: '' });
  const [error, setError]           = useState('');
  const [saving, setSaving]         = useState(false);

  // confirm dialogs for actions
  const [confirmAction, setConfirmAction] = useState(null); // { type, cita }

  async function fetchData() {
    setLoading(true);
    const [c, p, d, o, t] = await Promise.allSettled([getAppointments(), getAllPatients(), getAllDoctors(), getOffices(), getAppointmentTypes()]);
    setCitas(c.status === 'fulfilled' ? (c.value || []) : []);
    setPatients(p.status === 'fulfilled' ? (p.value || []) : []);
    setDoctors(d.status === 'fulfilled' ? (d.value || []) : []);
    setOffices(o.status === 'fulfilled' ? (o.value || []) : []);
    setTypes(t.status === 'fulfilled' ? (t.value || []) : []);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  async function handleAction(type, cita) {
    try {
      if (type === 'confirm') { await confirmAppointment(cita.id); toast.success('Cita confirmada.'); }
      else if (type === 'complete') { await completeAppointment(cita.id, ''); toast.success('Cita completada.'); }
      else if (type === 'noshow') { await setAsNoShowAppointment(cita.id); toast.success('Marcada como no asistió.'); }
      await fetchData();
    } catch (e) { toast.error(e.message || 'Error al actualizar la cita.'); }
  }

  async function handleCancel() {
    if (!cancelReason.trim()) { toast.error('El motivo de cancelación es obligatorio.'); return; }
    try {
      await cancelAppointment(selectedCita.id, cancelReason);
      toast.success('Cita cancelada.');
      setIsCancelModal(false);
      await fetchData();
    } catch (e) { toast.error(e.message || 'Error al cancelar.'); }
  }

  async function handleCreate() {
    if (!form.patientId || !form.doctorId || !form.officeId || !form.appointmentTypeId || !form.startTime) {
      setError('Todos los campos son obligatorios.'); return;
    }
    setSaving(true); setError('');
    try {
      const startTime = form.startTime.length === 16 ? form.startTime + ':00' : form.startTime;
      await createAppointment({ ...form, startTime });
      toast.success('Cita creada exitosamente.');
      await fetchData();
      setIsModalOpen(false);
    } catch (e) {
      setError(e.message || 'Error al crear la cita.');
    } finally {
      setSaving(false);
    }
  }

  const filtered = citas.filter(c => !filterStatus || c.status === filterStatus);

  return (
    <div>
      <div className="page-bar">
        <div>
          <h1 className="page-title">Citas</h1>
          <p className="page-subtitle">{citas.length} citas en total</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input" style={{ width: 160 }}>
              <option value="">Todos los estados</option>
              {Object.entries(STATUS_MAP).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => { setForm({ patientId: '', doctorId: '', officeId: '', appointmentTypeId: '', startTime: '' }); setError(''); setIsModalOpen(true); }}>
            <Plus size={16} /> Nueva Cita
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="medsys-table">
          <thead>
            <tr>{['Paciente', 'Doctor', 'Tipo', 'Fecha y hora', 'Estado', 'Acciones'].map(h => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? [1,2,3,4].map(i => (
              <tr key={i}>{[160,120,100,130,70,120].map((w,j) => <td key={j} style={{ padding: '13px 16px' }}><div className="skeleton" style={{ height: 14, width: w, borderRadius: 4 }} /></td>)}</tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon"><CalendarCheck size={24} /></div><p className="empty-state-text">{filterStatus ? 'No hay citas con ese estado.' : 'No hay citas registradas.'}</p></div></td></tr>
            ) : filtered.map(c => {
              const fecha = c.startTime ? new Date(c.startTime) : null;
              const st = STATUS_MAP[c.status] || { bg: '#f1f5f9', text: '#64748b', label: c.status };
              return (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.patientName || '—'}</td>
                  <td>{c.doctorName || '—'}</td>
                  <td>{c.appointmentTypeName || '—'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {fecha ? fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td><span className={`badge ${st.badge || 'badge-gray'}`}>{st.label}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {c.status === 'SCHEDULED' && <>
                        <button className="btn btn-sm" style={{ className: 'badge-green', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', padding: '4px 10px' }}
                          onClick={() => setConfirmAction({ type: 'confirm', cita: c })}>Confirmar</button>
                        <button className="btn btn-sm btn-danger"
                          onClick={() => { setSelectedCita(c); setCancelReason(''); setIsCancelModal(true); }}>Cancelar</button>
                      </>}
                      {c.status === 'CONFIRMED' && <>
                        <button className="btn btn-sm" style={{ background: '#ede9fe', color: '#7c3aed', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', padding: '4px 10px' }}
                          onClick={() => setConfirmAction({ type: 'complete', cita: c })}>Completar</button>
                        <button className="btn btn-sm" style={{ background: '#ffedd5', color: '#c2410c', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', padding: '4px 10px' }}
                          onClick={() => setConfirmAction({ type: 'noshow', cita: c })}>No asistió</button>
                        <button className="btn btn-sm btn-danger"
                          onClick={() => { setSelectedCita(c); setCancelReason(''); setIsCancelModal(true); }}>Cancelar</button>
                      </>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Nueva cita modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal">
            <div className="modal-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><h3 className="modal-title">Nueva Cita</h3>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: 6, display: "flex" }}><X size={18} /></button></div>
            <div className="modal-body">
              {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
              <div className="form-group">
                <label className="input-label">Paciente *</label>
                <select value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} className="input">
                  <option value="">Selecciona un paciente</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="input-label">Doctor *</label>
                <select value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} className="input">
                  <option value="">Selecciona un doctor</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}{d.specialtyName ? ` — ${d.specialtyName}` : ''}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="input-label">Tipo de cita *</label>
                <select value={form.appointmentTypeId} onChange={e => setForm({...form, appointmentTypeId: e.target.value})} className="input">
                  <option value="">Selecciona tipo</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name} ({t.durationMinutes} min)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="input-label">Consultorio *</label>
                <select value={form.officeId} onChange={e => setForm({...form, officeId: e.target.value})} className="input">
                  <option value="">Selecciona consultorio</option>
                  {offices.map(o => <option key={o.id} value={o.id}>{o.name}{o.location ? ` — ${o.location}` : ''}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="input-label">Fecha y hora *</label>
                <input type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="input" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Guardando...</> : 'Crear Cita'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancelar modal */}
      {isCancelModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsCancelModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><h3 className="modal-title">Cancelar Cita</h3>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: 6, display: "flex" }}><X size={18} /></button></div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                ¿Estás seguro de cancelar la cita de <strong>{selectedCita?.patientName}</strong>?
              </p>
              <div className="form-group">
                <label className="input-label">Motivo de cancelación *</label>
                <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="input" rows={3} placeholder="Describe el motivo..." style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsCancelModal(false)}>Volver</button>
              <button className="btn btn-danger" onClick={handleCancel}>Confirmar cancelación</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm action dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => handleAction(confirmAction?.type, confirmAction?.cita)}
        title={confirmAction?.type === 'confirm' ? 'Confirmar cita' : confirmAction?.type === 'complete' ? 'Completar cita' : 'Marcar como no asistió'}
        message={`¿Deseas ${confirmAction?.type === 'confirm' ? 'confirmar' : confirmAction?.type === 'complete' ? 'completar' : 'marcar como no asistió'} la cita de ${confirmAction?.cita?.patientName}?`}
        confirmLabel={confirmAction?.type === 'confirm' ? 'Confirmar' : confirmAction?.type === 'complete' ? 'Completar' : 'No asistió'}
        variant="warning"
      />
    </div>
  );
}
